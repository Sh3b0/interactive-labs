#!/bin/bash

expected=$(hostname -I)

actual=$(cat /home/eduk8s/exercises/ip.txt 2>/dev/null)

[[ "$expected" == "$actual" ]] && exit 0 || exit 1
