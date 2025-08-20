#!/bin/bash

read -r -p "Enter your username: " USERNAME

export SHELL="/usr/bin/fish"
export PATH=$PATH:/opt/terminal/scripts

asciinema rec -i 1 -c "zellij attach --create $USERNAME"
