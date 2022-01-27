package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"coordinator/constants"
	"coordinator/pkg/pubsub"
	"coordinator/utils"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}
var ps *pubsub.RedisPubSub

var port = flag.Int("port", 8080, "server port address")

func connect(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Couldn't upgrade connection", err)
		return
	}
	defer conn.Close()

	id, err := 123, nil // uuid.NewRandom()
	if err != nil {
		log.Println("Couldn't generate UUID", err)
		return
	}

	channel := ps.Subscribe(fmt.Sprintf("channel-%d", id))
	defer channel.Close()

	channel.OnMessage(func(msg *pubsub.Message) {
		if msg.Sender == constants.Coordinator {
			return
		}

		switch msg.Type {
		case constants.ExitMessage:
			// TODO: terminate appvm
		default:
			err := conn.WriteJSON(msg)
			if err != nil {
				log.Println("Error when write WS message", err)
				channel.Close()
				return
			}
		}
	})

	for {
		var msg pubsub.Message
		if err := conn.ReadJSON(&msg); err != nil {
			log.Println("Error when read WS message", err)
			return
		}

		switch msg.Type {
		case constants.StartMessage:
			// TODO: start appvm
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
