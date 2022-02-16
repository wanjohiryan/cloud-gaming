#!/bin/bash

VIDEO_PORT="$2" AUDIO_PORT="$3" WS_PORT="$4" docker-compose -p "$1" up --build
