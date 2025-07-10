#!/bin/bash
if [ ! -f perm_file1 ]; then
    exit 1
fi
if [ "$(stat -c '%a' perm_file1)" -ne 754 ]; then
    exit 1
fi
exit 0