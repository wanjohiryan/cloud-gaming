package webrtc

import (
	"fmt"
	"log"

	"streamer/utils"

	"github.com/pion/rtp"
	"github.com/pion/webrtc/v3"
)

type WebRTC struct {
	conn         *webrtc.PeerConnection
	ImageChannel chan *rtp.Packet
	AudioChannel chan *rtp.Packet
	InputChannel chan []byte
}

type OnIceCallback func(candidate string)
type OnExitCallback func()

func NewWebRTC() *WebRTC {
	return &WebRTC{
		ImageChannel: make(chan *rtp.Packet, 100),
		AudioChannel: make(chan *rtp.Packet, 100),
		InputChannel: make(chan []byte, 100),
	}
}

func (w *WebRTC) StartClient(vCodec string, iceCb OnIceCallback, exitCb OnExitCallback) (string, error) {
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
			w.StopClient()
		}
	}()

	log.Println("Start WebRTC..")

	conn, err := webrtc.NewPeerConnection(webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{URLs: []string{"stun:stun.l.google.com:19302"}},
		}},
	)
	if err != nil {
		return "", err
	}

	w.conn = conn

	// Create and add video track
	videoTrack, err := webrtc.NewTrackLocalStaticRTP(webrtc.RTPCodecCapability{
		MimeType: verbalCodecToMime(vCodec),
	}, "video", "pion")
	if err != nil {
		return "", err
	}

	_, err = w.conn.AddTrack(videoTrack)
	if err != nil {
		return "", err
	}

	// Create and add audio  track
	opusTrack, err := webrtc.NewTrackLocalStaticRTP(webrtc.RTPCodecCapability{
		MimeType: webrtc.MimeTypeOpus,
	}, "audio", "pion")
	if err != nil {
		return "", err
	}

	_, err = w.conn.AddTrack(opusTrack)
	if err != nil {
		return "", err
	}

	//Create a data channel for input
	inputTrack, err := w.conn.CreateDataChannel("app-input", nil)

	inputTrack.OnMessage(func(msg webrtc.DataChannelMessage) {
		w.InputChannel <- msg.Data
	})

	w.conn.OnICEConnectionStateChange(func(state webrtc.ICEConnectionState) {
		if state == webrtc.ICEConnectionStateConnected {
			log.Println("ICE Connected succeeded")
			w.startStreaming(videoTrack, opusTrack)
		}

		if state == webrtc.ICEConnectionStateFailed || state == webrtc.ICEConnectionStateClosed || state == webrtc.ICEConnectionStateDisconnected {
			log.Println("ICE Connection failed")
			exitCb()
		}
	})

	w.conn.OnICECandidate(func(iceCandidate *webrtc.ICECandidate) {
		if iceCandidate != nil {
			candidate, err := utils.EncodeBase64(iceCandidate.ToJSON())
			if err != nil {
				log.Println("Encode IceCandidate failed: " + iceCandidate.ToJSON().Candidate)
				return
			}
			iceCb(candidate)
		}
	})

	// Create offer
	offer, err := w.conn.CreateOffer(nil)
	if err != nil {
		return "", err
	}

	err = w.conn.SetLocalDescription(offer)
	if err != nil {
		return "", err
	}

	localSession, err := utils.EncodeBase64(offer)
	if err != nil {
		return "", err
	}

	return localSession, nil
}

func (w *WebRTC) SetRemoteSDP(remoteSDP string) error {
	var answer webrtc.SessionDescription

	err := utils.DecodeBase64(remoteSDP, &answer)
	if err != nil {
		log.Println("Decode remote sdp from peer failed")
		return err
	}

	err = w.conn.SetRemoteDescription(answer)
	if err != nil {
		log.Println("Set remote description from peer failed")
		return err
	}

	return nil
}

func (w *WebRTC) AddCandidate(candidate string) error {
	var iceCandidate webrtc.ICECandidateInit

	err := utils.DecodeBase64(candidate, &iceCandidate)
	if err != nil {
		log.Println("Decode Ice candidate from peer failed")
		return err
	}

	err = w.conn.AddICECandidate(iceCandidate)
	if err != nil {
		log.Println("Add Ice candidate from peer failed")
		return err
	}

	return nil
}

func (w *WebRTC) StopClient() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered from err. Maybe we closed a closed channel", r)
		}
	}()

	w.conn.Close()

	close(w.ImageChannel)
	close(w.AudioChannel)
	close(w.InputChannel)
}

func (w *WebRTC) startStreaming(videoTrack *webrtc.TrackLocalStaticRTP, opusTrack *webrtc.TrackLocalStaticRTP) {
	go func() {
		for packet := range w.ImageChannel {
			if err := videoTrack.WriteRTP(packet); err != nil {
				log.Println("Error when writing RTP to video track", err)
			}
		}
	}()

	go func() {
		for packet := range w.AudioChannel {
			if err := opusTrack.WriteRTP(packet); err != nil {
				log.Println("Error when writing RTP to opus track", err)
			}
		}
	}()
}

func verbalCodecToMime(vCodec string) string {
	switch vCodec {
	case "h264":
		return webrtc.MimeTypeH264
	case "vpx":
		return webrtc.MimeTypeVP8
	default:
		return webrtc.MimeTypeVP8
	}
}
