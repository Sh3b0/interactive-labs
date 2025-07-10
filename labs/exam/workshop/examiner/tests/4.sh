#!/bin/bash

grep -r "error" /etc/*.conf 2>/dev/null | diff - /home/eduk8s/exercises/errors.txt >/dev/null
exit $?
