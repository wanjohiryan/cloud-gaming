package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"coordinator/app/session"
)

var port = flag.Int("port", 8080, "server port address")

func main() {
	flag.Parse()

	http.HandleFunc("/ws", session.NewSession)
	log.Println("Start listening on port", *port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), nil))
}
