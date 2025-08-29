#!/bin/bash

# Takes text input from stdin and sends it to terminal dashboard
# To later get copied to clipboard

text=$(cat | base64 -w0)
curl -X POST -H "Content-Type: application/json" \
  -d "{\"action\":\"dashboard:copy-text\",\"data\":{\"text_b64\":\"$text\"}}" \
  http://localhost:10081/message/broadcast
