package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os/exec"

	"coordinator/constants"
	"coordinator/pkg/pubsub"
	"coordinator/utils"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}
var ps *pubsub.RedisPubSub

var port = flag.Int("port", 8080, "server port address")

func startVM(id uuid.UUID) error {
	log.Println("Spinning off VM", id.String())

	cmd := exec.Command("./startVM.sh", id.String())
	if err := cmd.Start(); err != nil {
		return err
	}

	return nil
}

func stopVM(id uuid.UUID) error {
	log.Println("Stopping VM", id.String())

	cmd := exec.Command("./stopVM.sh", id.String())
	if err := cmd.Start(); err != nil {
		return err
	}

	return nil
}

func connect(w http.ResponseWriter, r *http.Request) {
	done := make(chan struct{})

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Couldn't upgrade connection", err)
		return
	}
	defer conn.Close()

	id, err := uuid.NewRandom()
	if err != nil {
		log.Println("Couldn't generate UUID", err)
		return
	}

	channelName := fmt.Sprintf("channel-%s", id.String())
	channel := ps.Subscribe(channelName)
	defer channel.Close()

	channel.OnMessage(func(msg *pubsub.Message) {
		if msg.Sender == constants.Coordinator {
			return
		}

		switch msg.Type {
		case constants.ExitMessage:
			if err := stopVM(id); err != nil {
				log.Println("Error when stop VM with ID", id.String(), err)
				done <- struct{}{}
				return
			}
		default:
			if err := conn.WriteJSON(msg); err != nil {
				log.Println("Error when write WS message", err)
				done <- struct{}{}
				return
			}
		}
	})

	for {
		select {
		case <-done:
			return
		default:
			msgType, rawMsg, err := conn.ReadMessage()
			if err != nil {
				log.Println("Error when read WS message", err)
				return
			}
			if msgType != websocket.TextMessage {
				continue
			}

			var msg pubsub.Message
			if err := json.Unmarshal(rawMsg, &msg); err != nil {
				log.Println("Error when parse WS message", err)
				continue
			}

			switch msg.Type {
			case constants.StartMessage:
				if err := startVM(id); err != nil {
					log.Println("Error when start VM with ID", id.String(), err)
					return
				}
			case constants.ExitMessage:
				if err := stopVM(id); err != nil {
					log.Println("Error when stop VM with ID", id.String(), err)
					return
				}
			default:
				err := channel.Publish(&pubsub.Message{
					Sender:    constants.Coordinator,
					Recipient: constants.Relayer,
					Type:      msg.Type,
					Data:      msg.Data,
				})
				if err != nil {
					log.Println("Couldn't publish message to relayer", err)
					continue
				}
			}
		}
	}
}

func main() {
	var err error

	redisAddr := fmt.Sprintf("%s:%s", utils.MustEnv("REDIS_HOST"), utils.MustEnv("REDIS_PORT"))
	ps, err = pubsub.NewRedisPubSub(redisAddr, "")
	if err != nil {
		panic(fmt.Sprintf("Couldn't create a pubsub %s", err))
	}
	defer ps.Close()

	flag.Parse()
	http.HandleFunc("/ws", connect)
	log.Println("Start listening on port", *port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), nil))
}
