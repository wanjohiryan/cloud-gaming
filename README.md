# CLOUD GAMING [WIP]

This project allows users to play computer games on browsers, without download or installation, just at the push of a button.
This means that users can play AAA games on their low-spec computers or smartphones or even smart TVs anywhere and anytime.
The only requirement is fast and reliable internet.

## Design doc

This project is inspired by [cloudmorph](https://github.com/giongto35/cloud-morph).
The basic idea of the project is running games in Wine within Docker containers.
The video and audio from games are captured by Xvfb, Pulseaudio and processed by ffmpeg and then streamed to browsers of users using WebRTC.
Besides that, input from users (e.g. mouse clicks, keyboard events) are also captured and delivered to Syncinput using WebRTC Data channel.
Syncinput is a process that receives those input and simulate relevant actions for the games using WinAPI.

Currently, you can take a look at this [design doc](https://drive.google.com/file/d/1rK0xMrDPr4zFIc1PnO3dA7qmXs0rRuHA/view?usp=sharing) to understand more about the project.