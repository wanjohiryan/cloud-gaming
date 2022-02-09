package main

import (
	"encoding/json"
	"fmt"
	"log"
	"streamer/utils"

	"streamer/app/stream"
	"streamer/app/webrtc"
	"streamer/constants"
	"streamer/pkg/pubsub"
)

func main() {
	ID := utils.MustEnv("ID")
	screenWidth := utils.MustStrToFloat32(utils.MustEnv("SCREEN_WIDTH"))
	screenHeight := utils.MustStrToFloat32(utils.MustEnv("SCREEN_HEIGHT"))
	videoRelayPort := utils.MustStrToInt(utils.MustEnv("VIDEO_RELAY_PORT"))
	audioRelayPort := utils.MustStrToInt(utils.MustEnv("AUDIO_RELAY_PORT"))

	// Create channel pubsub for communication with coordinator
	redisAddr := fmt.Sprintf("%s:%s", utils.MustEnv("REDIS_HOST"), utils.MustEnv("REDIS_PORT"))
	ps, err := pubsub.NewRedisPubSub(redisAddr, "")
	if err != nil {
		panic(fmt.Sprintf("Couldn't create a pubsub %s", err))
	}
	defer ps.Close()

	channel := ps.Subscribe(fmt.Sprintf("channel-%s", ID))
	defer channel.Close()

	// Start WebRTC
	webrtcClient := webrtc.NewWebRTC()

	// Start relaying streams
	relayer, err := stream.NewStreamRelayer(webrtcClient.ImageChannel, webrtcClient.AudioChannel, videoRelayPort, audioRelayPort, screenWidth, screenHeight)
	if err != nil {
		panic(fmt.Sprintf("Couldn't create a stream relayer %s", err))
	}
	if err := relayer.Start(); err != nil {
		panic(fmt.Sprintf("Couldn't start relaying streams %s", err))
	}

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
	offer, err := webrtcClient.StartClient("h264", onIceCandidateCb, onExitCb)
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

	//bridgeStreamRelayerAndWebRTC(relayer, webrtcClient)

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
