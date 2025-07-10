#!/bin/bash

temp_file=$(mktemp)

find / -type f -perm -4000 2>/dev/null > "$temp_file"
if diff -q "$temp_file" /home/eduk8s/exercises/suid.txt >/dev/null; then
    rm "$temp_file"
    exit 0
else
    rm "$temp_file"
    exit 1
fi
