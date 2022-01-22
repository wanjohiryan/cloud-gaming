package pubsub

import (
	"context"
	"encoding/json"
	"log"

	"github.com/go-redis/redis/v8"
)

type PubSub interface {
	Subscribe(channel string) Channel
	Close() error
}

type RedisPubSub struct {
	client *redis.Client
}

var _ PubSub = (*RedisPubSub)(nil)

type MessageType string

type Message struct {
	Sender    string      `json:"sender"`
	Recipient string      `json:"recipient"`
	Type      MessageType `json:"type"`
	Data      string      `json:"data"`
}

type Channel interface {
	Publish(msg *Message) error
	OnMessage(cb func(msg *Message))
	Close() error
}

type RedisChannel struct {
	client     *redis.Client
	name       string
	subscriber *redis.PubSub
}

var _ Channel = (*RedisChannel)(nil)

func NewRedisPubSub(addr, pwd string) (*RedisPubSub, error) {
	c := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: pwd,
	})

	err := c.Ping(context.Background()).Err()
	if err != nil {
		return nil, err
	}

	return &RedisPubSub{client: c}, nil
}

func (p *RedisPubSub) Subscribe(channel string) Channel {
	log.Println("Subscribed to channel", channel)

	s := p.client.Subscribe(context.Background(), channel)

	return &RedisChannel{
		client:     p.client,
		name:       channel,
		subscriber: s,
	}
}

func (p *RedisPubSub) Close() error {
	return p.client.Close()
}

func (c *RedisChannel) Publish(msg *Message) error {
	payload, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	if err := c.client.Publish(context.Background(), c.name, payload).Err(); err != nil {
		return err
	}

	return nil
}

func (c *RedisChannel) OnMessage(cb func(msg *Message)) {
	go func() {
		for {
			rawMsg, err := c.subscriber.ReceiveMessage(context.Background())
			if err != nil {
				log.Println("Couldn't receive message from Redis channel", err)
				continue
			}

			var msg Message

			if err := json.Unmarshal([]byte(rawMsg.Payload), &msg); err != nil {
				log.Println("Couldn't parse message from Redis channel", err)
				continue
			}

			cb(&msg)
		}
	}()
}

func (c *RedisChannel) Close() error {
	return c.subscriber.Close()
}
