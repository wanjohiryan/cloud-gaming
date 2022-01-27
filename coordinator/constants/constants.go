package constants

import (
	"coordinator/pkg/pubsub"
)

const StartMessage pubsub.MessageType = "start"
const ExitMessage pubsub.MessageType = "exit"

const Relayer = "relayer"
const Coordinator = "coordinator"
