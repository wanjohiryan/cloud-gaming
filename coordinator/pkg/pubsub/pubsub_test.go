package pubsub

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewRedisPubSub(t *testing.T) {
	_, err := NewRedisPubSub("localhost:6379", "")
	require.NoError(t, err)
}

func TestRedisChannel(t *testing.T) {
	ps, err := NewRedisPubSub("localhost:6379", "")
	require.NoError(t, err)

	c := ps.Subscribe("some-channel")

	received := make(chan bool)
	c.OnMessage(func(msg *Message) {
		if msg.Type == "test" {
			received <- true
		}
	})

	err = c.Publish(&Message{Type: "test"})
	require.NoError(t, err)

	go func() {
		<-time.NewTimer(3 * time.Second).C
		received <- false
	}()

	assert.True(t, <-received)

	assert.NoError(t, c.Close())
	assert.NoError(t, ps.Close())
}
