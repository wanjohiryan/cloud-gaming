package constants

type MessageType string

const StartMessage MessageType = "start"
const ExitMessage MessageType = "exit"
const SDPMessage MessageType = "sdp"
const IceCandidateMessage MessageType = "ice-candidate"
const RetryMessage MessageType = "retry"

const Relayer = "relayer"
const Coordinator = "coordinator"

const startVideoRTPPort = 5004
const startAudioRTPPort = 4004
const WineConnPort = 9090
const KeyUp = "KEYUP"
const KeyDown = "KEYDOWN"
const MouseMove = "MOUSEMOVE"
const MouseUp = "MOUSEUP"
const MouseDown = "MOUSEDOWN"
