#!/bin/bash

ytt -f templates \
  -v SESSION_NAMESPACE=$SESSION_NAMESPACE \
  -v INGRESS_DOMAIN=$INGRESS_DOMAIN \
  -v POLICY_ENGINE=$POLICY_ENGINE \
  --output-files exercises

find exercises -type d -exec chmod 0755 {} \;
find exercises -type f -exec chmod 0644 {} \;
