#!/bin/bash

set -x

TMPFILE=/tmp/examiner-$(basename "$0")

trap 'rm -f $TMPFILE' EXIT

cat - > "$TMPFILE"

USERNAME=$(jq -r ".name" "$TMPFILE")

docker run -it --rm -v .:/home/dev --name labenv -w "/home/dev" --cap-add=sys_admin -e USERNAME="$USERNAME" sh3b0/recorder
