#!/bin/bash

apt-get update

# install docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# install Go
apt-get install -y golang-go

# build docker containers
docker-compose build --parallel

# build and run coordinator
export $(cat .env.coordinator | xargs)

go run main.go
