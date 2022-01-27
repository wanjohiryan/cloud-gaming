package constants

import (
	"streamer/pkg/pubsub"
)

const WineConnPort = 9090
const KeyUp = "KEYUP"
const KeyDown = "KEYDOWN"
const MouseMove = "MOUSEMOVE"
const MouseUp = "MOUSEUP"
const MouseDown = "MOUSEDOWN"

const SDPMessage pubsub.MessageType = "sdp"
const IceCandidateMessage pubsub.MessageType = "ice-candidate"
const ExitMessage pubsub.MessageType = "exit"

const Relayer = "relayer"
const Coordinator = "coordinator"
