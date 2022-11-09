package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"coordinator/app/session"
	"coordinator/settings"

	"github.com/rs/cors"
)

var port = flag.Int("port", 8080, "server port address")

func main() {
	flag.Parse()

	mux := http.NewServeMux()
	// mux.HandleFunc("/apps", apps.GetAppList)
	mux.HandleFunc("/ws", session.NewSession)

	c := cors.New(cors.Options{
		AllowedOrigins: settings.AllowedOrigins,
	})
	handler := c.Handler(mux)

	log.Println("Start listening on port", *port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), handler))
}
