FROM golang:1.17

WORKDIR /code

COPY . /code/

RUN go mod download

RUN go build -o stream_relayer main.go

ENTRYPOINT ["./stream_relayer"]


