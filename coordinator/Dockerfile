FROM golang:1.17

WORKDIR /code

COPY . /code/

RUN go mod download

RUN go build -o coordinator main.go

ENTRYPOINT ["./coordinator"]


