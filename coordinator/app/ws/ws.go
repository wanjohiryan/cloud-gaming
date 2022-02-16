package ws

import (
	"coordinator/constants"
	"coordinator/settings"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type constants.MessageType `json:"type"`
	Data string                `json:"data"`
}

type Connection struct {
	conn *websocket.Conn
	mu   sync.Mutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		for _, origin := range settings.AllowedOrigins {
			if r.Header.Get("Origin") == origin || origin == "*" {
				return true
			}
		}

		return false
	},
}

func NewWsConnection(w http.ResponseWriter, r *http.Request) (*Connection, error) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return nil, err
	}

	return &Connection{conn: conn}, nil
}

func (c *Connection) Send(v interface{}) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.conn.WriteJSON(v)
}

func (c *Connection) ReadText() ([]byte, error) {
	for {
		msgType, rawMsg, err := c.conn.ReadMessage()
		if err != nil {
			return nil, err
		}

		if msgType != websocket.TextMessage {
			continue
		}

		return rawMsg, nil
	}
}

func (c *Connection) Close() error {
	return c.conn.Close()
}
