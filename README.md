# Clumsy

Interactive labs covering Linux, Git, and Docker

## Deployment

1. Install CLI tools (e.g., in /usr/local/bin)

    ```bash
    curl -o educates -sL https://github.com/educates/educates-training-platform/releases/latest/download/educates-linux-amd64 && chmod +x educates
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    ```

2. Create a cluster

    ```bash
    educates create-cluster
    ```

3. Deploy workshop

    ```bash
    cd <workshop-dir>
    educates publish-workshop && educates deploy-workshop
    ```

4. Manage workshops

    ```bash
    educates browse-workshops
    educates view-credentials # Password for the web interface
    educates list-workshops
    educates delete-workshop -a "Workshop Name"
    ```

## KubeVirt Quick Start

> <https://killercoda.com/kubevirt/scenario/kubevirt-101>

```bash
# Download and deploy latest version
export KUBEVIRT_VERSION=$(curl -s https://api.github.com/repos/kubevirt/kubevirt/releases/latest | jq -r .tag_name)
echo $KUBEVIRT_VERSION
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/${KUBEVIRT_VERSION}/kubevirt-operator.yaml
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/${KUBEVIRT_VERSION}/kubevirt-cr.yaml
kubectl -n kubevirt patch kubevirt kubevirt --type=merge --patch '{"spec":{"configuration":{"developerConfiguration":{"useEmulation":true}}}}'

# Install virtctl
wget -O virtctl https://github.com/kubevirt/kubevirt/releases/download/${KUBEVIRT_VERSION}/virtctl-${KUBEVIRT_VERSION}-linux-amd64
chmod +x virtctl

# Check kubevirt deployment
kubectl get pods -n kubevirt
kubectl -n kubevirt get kubevirt

# Deploy VMs
kubectl get vms
kubectl get vms -o yaml testvm | grep -E 'runStrategy:.*|$'

# Start a VM
./virtctl start testvm

# Check VM status
kubectl get vms

# Access a VM
./virtctl console testvm

# Shutdown and cleanup
./virtctl stop testvm
kubectl delete vms testvm
```
