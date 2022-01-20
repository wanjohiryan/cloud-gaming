package main

import "streamer/pkg/pubsub"

const VideoRTPPort = 5004
const AudioRTPPort = 4004
const WineConnPort = 9090
const KeyUp = "KEYUP"
const KeyDown = "KEYDOWN"
const MouseMove = "MOUSEMOVE"
const MouseUp = "MOUSEUP"
const MouseDown = "MOUSEDOWN"

const SDPMessage pubsub.MessageType = "sdp"
const IceCandidateMessage pubsub.MessageType = "ice-candidate"

const Relayer = "relayer"
const Coordinator = "coordinator"
