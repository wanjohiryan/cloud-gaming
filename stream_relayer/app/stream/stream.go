package stream

import (
	"container/ring"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"time"

	"streamer/constants"

	"github.com/pion/rtp"
)

type Packet struct {
	Type string `json:"type"`
	Data string `json:"data"`
}

type StreamRelayer struct {
	VideoStream   chan *rtp.Packet
	AudioStream   chan *rtp.Packet
	AppEvents     chan Packet
	videoListener *net.UDPConn
	audioListener *net.UDPConn
	wineConn      *net.TCPConn
	screenWidth   float32
	screenHeight  float32
}

func NewStreamRelayer(videoRelayPort, audioRelayPort int, screenWidth, screenHeight float32) (*StreamRelayer, error) {
	s := &StreamRelayer{
		VideoStream:  make(chan *rtp.Packet, 100),
		AudioStream:  make(chan *rtp.Packet, 100),
		AppEvents:    make(chan Packet, 100),
		screenWidth:  screenWidth,
		screenHeight: screenHeight,
	}

	var err error

	s.videoListener, err = newUDPListener(videoRelayPort)
	if err != nil {
		return nil, err
	}

	s.audioListener, err = newUDPListener(audioRelayPort)
	if err != nil {
		return nil, err
	}

	return s, nil
}

func (s *StreamRelayer) Start() error {
	log.Println("Start relaying streams..")

	la, err := net.ResolveTCPAddr("tcp4", fmt.Sprintf(":%d", constants.WineConnPort))
	if err != nil {
		return err
	}
	ln, err := net.ListenTCP("tcp", la)
	if err != nil {
		return err
	}

	wineConnected := make(chan struct{})

	go func() {
		for {
			log.Printf("Waiting for syncinput to connect on port :%d\n", constants.WineConnPort)

			conn, err := ln.AcceptTCP()
			if err != nil {
				log.Println("Couldn't accept syncinput connection", err)
				continue
			}

			err = conn.SetKeepAlive(true)
			if err != nil {
				log.Println("Couldn't set keepAlive", err)
				continue
			}
			err = conn.SetKeepAlivePeriod(10 * time.Second)
			if err != nil {
				log.Println("Couldn't set keepAlive period", err)
				continue
			}

			s.wineConn = conn
			wineConnected <- struct{}{}

			log.Println("Successfully set up syncinput connection")
		}
	}()

	<-wineConnected

	go s.healthCheckVM()
	go s.handleAppEvents()
	go s.relayStream(s.videoListener, s.VideoStream)
	go s.relayStream(s.audioListener, s.AudioStream)

	return nil
}

func (s *StreamRelayer) relayStream(listener *net.UDPConn, output chan<- *rtp.Packet) {
	defer func() {
		if r := recover(); r != nil {
			// maybe output channel is closed
			_ = listener.Close()
		}
	}()

	r := ring.New(120)

	n := r.Len()
	for i := 0; i < n; i++ {
		r.Value = make([]byte, 1500)
		r = r.Next()
	}

	for {
		inboundRTPPacket := r.Value.([]byte)
		r = r.Next()

		n, _, err := listener.ReadFrom(inboundRTPPacket)
		if err != nil {
			log.Println("Error during read RTP packet", err)
			continue
		}

		var packet rtp.Packet
		if err := packet.Unmarshal(inboundRTPPacket[:n]); err != nil {
			log.Println("Error during unmarshalling RTP packet", err)
			continue
		}

		output <- &packet
	}
}

func (s *StreamRelayer) healthCheckVM() {
	log.Println("Start health checking")

	for {
		if s.wineConn != nil {
			_, err := s.wineConn.Write([]byte{0})
			if err != nil {
				log.Println("Error while health checking", err)
			}
		}

		time.Sleep(2 * time.Second)
	}
}

func (s *StreamRelayer) handleAppEvents() {
	for packet := range s.AppEvents {
		switch packet.Type {
		case constants.KeyUp:
			s.simulateKey(packet.Data, 0)
		case constants.KeyDown:
			s.simulateKey(packet.Data, 1)
		case constants.MouseMove:
			s.simulateMouseEvent(packet.Data, 0)
		case constants.MouseDown:
			s.simulateMouseEvent(packet.Data, 1)
		case constants.MouseUp:
			s.simulateMouseEvent(packet.Data, 2)
		}
	}
}

type keydownPayload struct {
	KeyCode int `json:"keycode"`
}

func (s *StreamRelayer) simulateKey(jsonPayload string, keyState byte) {
	if s.wineConn == nil {
		return
	}

	p := &keydownPayload{}
	err := json.Unmarshal([]byte(jsonPayload), &p)
	if err != nil {
		log.Println("Couldn't parse keydown payload")
		return
	}

	vmKeyMsg := fmt.Sprintf("K%d,%b|", p.KeyCode, keyState)
	_, err = s.wineConn.Write([]byte(vmKeyMsg))
	if err != nil {
		log.Println("Couldn't send key event to wine")
		return
	}
}

type mousePayload struct {
	IsLeft byte    `json:"isLeft"`
	X      float32 `json:"x"`
	Y      float32 `json:"y"`
	Width  float32 `json:"width"`
	Height float32 `json:"height"`
}

func (s *StreamRelayer) simulateMouseEvent(jsonPayload string, mouseState int) {
	if s.wineConn == nil {
		return
	}

	p := &mousePayload{}
	err := json.Unmarshal([]byte(jsonPayload), &p)
	if err != nil {
		log.Println("Couldn't parse mouse payload")
		return
	}

	p.X = p.X * s.screenWidth / p.Width
	p.Y = p.Y * s.screenHeight / p.Height

	// Mouse is in format of comma separated "12.4,52.3"
	vmMouseMsg := fmt.Sprintf("M%d,%d,%f,%f,%f,%f|", p.IsLeft, mouseState, p.X, p.Y, p.Width, p.Height)
	_, err = s.wineConn.Write([]byte(vmMouseMsg))
	if err != nil {
		log.Println("Couldn't send mouse event to wine")
		return
	}
}

func newUDPListener(rtpPort int) (*net.UDPConn, error) {
	ln, err := net.ListenUDP("udp", &net.UDPAddr{
		IP:   net.ParseIP("localhost"),
		Port: rtpPort,
	})
	if err != nil {
		return nil, err
	}

	return ln, nil
}
