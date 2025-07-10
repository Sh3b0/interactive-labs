#!/bin/bash
if [ ! -f home.tar.gz ] || [ ! -f home.tar.bz2 ]; then
    exit 1
fi
if ! file home.tar.gz | grep -q gzip; then
    exit 1
fi
if ! file home.tar.bz2 | grep -q bzip2; then
    exit 1
fi
exit 0