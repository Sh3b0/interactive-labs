#!/bin/bash

if ! file /home/eduk8s/exercises/home.tar.gz | grep -q gzip; then
    exit 1
fi

exit 0