package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"

	"streamer/app/pubsub"
	"streamer/constants"
	"streamer/pkg/stream"
	"streamer/pkg/webrtc"
)

func MustEnv(name string) string {
	env := os.Getenv(name)
	if env == "" {
		panic(fmt.Sprintf("Missing env %s", name))
	}

	return env
}

func MustStrToFloat32(val string) float32 {
	fVal, err := strconv.ParseFloat(val, 32)
	if err != nil {
		panic(fmt.Sprintf("Couldn't convert str to float32: %s", err))
	}

	return float32(fVal)
}

func MustStrToInt(val string) int {
	iVal, err := strconv.ParseInt(val, 10, 32)
	if err != nil {
		panic(fmt.Sprintf("Couldn't convert str to int: %s", err))
	}

	return int(iVal)
}

func main() {
	ID := MustEnv("ID")
	screenWidth := MustStrToFloat32(MustEnv("SCREEN_WIDTH"))
	screenHeight := MustStrToFloat32(MustEnv("SCREEN_HEIGHT"))
	videoRelayPort := MustStrToInt(MustEnv("VIDEO_RELAY_PORT"))
	audioRelayPort := MustStrToInt(MustEnv("AUDIO_RELAY_PORT"))

	// Start relaying streams
	relayer, err := stream.NewStreamRelayer(videoRelayPort, audioRelayPort, screenWidth, screenHeight)
	if err != nil {
		panic(fmt.Sprintf("Couldn't create a stream relayer %s", err))
	}
	if err := relayer.Start(); err != nil {
		panic(fmt.Sprintf("Couldn't start relaying streams %s", err))
	}

	// Create channel pubsub for communication with coordinator
	redisAddr := fmt.Sprintf("%s:%s", MustEnv("REDIS_HOST"), MustEnv("REDIS_PORT"))
	ps, err := pubsub.NewRedisPubSub(redisAddr, "")
	if err != nil {
		panic(fmt.Sprintf("Couldn't create a pubsub %s", err))
	}
	defer ps.Close()

	channel := ps.Subscribe(fmt.Sprintf("channel-%s", ID))
	defer channel.Close()

	// Start WebRTC
	webrtcClient := webrtc.NewWebRTC()
	onIceCandidateCb := func(candidate string) {
		err := channel.Publish(&pubsub.Message{
			Sender:    constants.Relayer,
			Recipient: constants.Coordinator,
			Type:      constants.IceCandidateMessage,
			Data:      candidate,
		})
		if err != nil {
			log.Println("Couldn't send candidate", err)
		}
	}
	onExitCb := func() {
		// must close in this order due to stream bridging
		close(relayer.VideoStream)
		close(relayer.AudioStream)
		webrtcClient.StopClient()
		close(relayer.AppEvents)

		err = channel.Publish(&pubsub.Message{
			Sender:    constants.Relayer,
			Recipient: constants.Coordinator,
			Type:      constants.ExitMessage,
			Data:      "",
		})
		if err != nil {
			log.Println("Couldn't send exit message", err)
		}
	}
	offer, err := webrtcClient.StartClient("vpx", onIceCandidateCb, onExitCb)
	if err != nil {
		panic(fmt.Sprintf("Couldn't start webrtc client %s", err))
	}

	err = channel.Publish(&pubsub.Message{
		Sender:    constants.Relayer,
		Recipient: constants.Coordinator,
		Type:      constants.SDPMessage,
		Data:      offer,
	})
	if err != nil {
		panic(fmt.Sprintf("Couldn't send offer to WebRTC client %s", err))
	}

	channel.OnMessage(func(msg *pubsub.Message) {
		if msg.Recipient != constants.Relayer {
			return
		}

		switch msg.Type {
		case constants.SDPMessage:
			err := webrtcClient.SetRemoteSDP(msg.Data)
			if err != nil {
				panic(fmt.Sprintf("Couldn't set remote SDP %s", err))
			}
		case constants.IceCandidateMessage:
			err := webrtcClient.AddCandidate(msg.Data)
			if err != nil {
				panic(fmt.Sprintf("Couldn't set ICE candidate %s", err))
			}
		}
	})

	bridgeStreamRelayerAndWebRTC(relayer, webrtcClient)

	exit := make(chan struct{})
	<-exit
}

type WebRTCMessage struct {
	Type string `json:"type"`
	Data string `json:"data"`
}

func bridgeStreamRelayerAndWebRTC(relayer *stream.StreamRelayer, webrtcClient *webrtc.WebRTC) {
	log.Println("Start bridging streams..")

	go func() {
		for packet := range relayer.VideoStream {
			webrtcClient.ImageChannel <- packet
		}
	}()

	go func() {
		for packet := range relayer.VideoStream {
			webrtcClient.AudioChannel <- packet
		}
	}()

	go func() {
		for rawInput := range webrtcClient.InputChannel {
			var msg WebRTCMessage
			if err := json.Unmarshal(rawInput, &msg); err != nil {
				log.Println("Couldn't parse webrtc data message")
				continue
			}

			relayer.AppEvents <- stream.Packet{
				Type: msg.Type,
				Data: msg.Data,
			}
		}
	}()
}
