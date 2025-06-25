#!/bin/bash

if docker ps --format '{{.Names}}' | grep -q "^labenv$"; then
    exit 0
else
    exit 1
fi
