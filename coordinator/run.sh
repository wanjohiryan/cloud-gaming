export $(cat .env.coordinator | xargs)

go run main.go
