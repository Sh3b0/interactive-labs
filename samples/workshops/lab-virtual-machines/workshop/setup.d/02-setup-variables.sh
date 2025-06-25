#!/bin/bash

set -x

VM_CLUSTER_IP=A.B.C.D

VM_CLUSTER_IP_COMMAND="kubectl get services vm -o jsonpath='{.spec.clusterIP}'"

STATUS=1; ATTEMPTS=0; until [ $STATUS -eq 0 ] || VM_CLUSTER_IP=$($VM_CLUSTER_IP_COMMAND) || [ $ATTEMPTS -eq 5 ]; do sleep 5; VM_CLUSTER_IP=$($VM_CLUSTER_IP_COMMAND); STATUS=$?; ATTEMPTS=$((ATTEMPTS + 1)); done

cat > /opt/workshop/content/vars.liquid << EOF
{% assign VM_CLUSTER_IP = $VM_CLUSTER_IP %}
EOF
