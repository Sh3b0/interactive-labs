#!/bin/bash

if [ -n "$HOSTNAME" ]; then
    echo "$HOSTNAME" | sudo tee /etc/hostname
    echo "127.0.0.1 $HOSTNAME" | sudo tee -a /etc/hosts
    sudo hostname "$HOSTNAME"
else
    read -r -p "Enter username to set as hostname: " HOSTNAME
fi

export USER=$HOSTNAME
export TERM=xterm
export SHELL="/bin/fish"

asciinema rec -i 1 -c 'fish'
