#!/bin/bash

read -r -p "Enter username to set as hostname: " HOSTNAME

export USER="$HOSTNAME"
export SHELL="/bin/bash"

echo 'PS1="\[\e[1;32m\]\u@$HOSTNAME\[\e[0m\]:\[\e[1;34m\]\w\[\e[0m\]\$ "' > /tmp/prompt
asciinema rec -i 1 -c "bash --rcfile /tmp/prompt"
