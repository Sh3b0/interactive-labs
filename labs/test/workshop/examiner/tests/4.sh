#!/bin/bash
if [ ! -f /tmp/hard2 ] || [ -e /tmp/hard1 ] || [ -e /tmp/hard3 ]; then
    exit 1
fi
if [ "$(cat /tmp/hard2)" != "Redhat" ]; then
    exit 1
fi
if [ "$(stat -c '%h' /tmp/hard2)" -ne 1 ]; then
    exit 1
fi
exit 0