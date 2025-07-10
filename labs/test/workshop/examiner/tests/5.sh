#!/bin/bash
if [ ! -L /root/soft1 ]; then
    exit 1
fi
if [ "$(readlink /root/soft1)" != "/tmp/hard2" ]; then
    exit 1
fi
if [ -e /root/soft1 ] || [ -e /tmp/hard2 ]; then
    exit 1
fi
exit 0