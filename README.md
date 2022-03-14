# CLOUD GAMING 

This project allows users to play computer games on browsers, without download or installation, just at the push of a button.
This means that users can play AAA games on their low-spec computers or smartphones or even smart TVs anywhere and anytime.
The only requirement is fast and reliable internet.

![Playing Demo](https://user-images.githubusercontent.com/16115992/158131855-dcc0ff60-df98-491c-aaea-a2eca76bb228.gif)

## How to run
- Start server:
```
cd coordinator
./run.sh
```

- Start client:
```
cd web
npm install
npm start
```

## Design

This project is inspired by [cloudmorph](https://github.com/giongto35/cloud-morph).
The basic idea of the project is running games in Wine within Docker containers.
The video and audio from games are captured by Xvfb, Pulseaudio and processed by ffmpeg and then streamed to browsers of users using WebRTC.
Besides that, input from users (e.g. mouse clicks, keyboard events) are also captured and delivered to Syncinput using WebRTC Data channel.
Syncinput is a process that receives those input and simulate relevant events for the games using WinAPI.
