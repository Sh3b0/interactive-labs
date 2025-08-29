#!/bin/bash

read -r -p "Enter your username: " USERNAME

export SHELL="/usr/bin/fish"
export PATH=$PATH:/opt/terminal/scripts

mkdir -p /home/dev/recordings

# Use Moscow time (UTC+3) for the recording filename
DATE_TIME=$(TZ=Europe/Moscow date '+%Y-%m-%d_%H-%M-%S')
asciinema rec -i 1 -c "zellij attach --create $USERNAME" "/home/dev/recordings/$DATE_TIME.cast"
