#!/bin/bash

docker run -it --rm -v .:/home/dev --name labenv -w "/home/dev" --cap-add=sys_admin sh3b0/recorder
