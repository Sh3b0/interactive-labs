#!/bin/bash

read -r -p "Enter username to set as hostname: " HOSTNAME

if [ -n "$HOSTNAME" ]; then
    echo "$HOSTNAME" | sudo tee /etc/hostname
    echo "127.0.0.1 $HOSTNAME" | sudo tee -a /etc/hosts
    sudo hostname "$HOSTNAME"
fi

export USER=$HOSTNAME
export TERM=xterm
export SHELL="/bin/bash"

asciinema rec -c 'bash'
