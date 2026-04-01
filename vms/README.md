# LabEnv VMs

Instructions to run and build virtual machine images for the lab environment.

## Prerequisites

### Windows

1. Follow [documentation](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/install-hyper-v?tabs=gui&pivots=windows) to enable Hyper-V.

1. Install needed tools: [Git](https://git-scm.com/install/windows), [QEMU](https://qemu.weilnetz.de/w64/), and [Finch](https://github.com/runfinch/finch/releases/) (for `limactl`)

1. Ensure required directories are added to system and user PATH.

1. Ensure the installed CLI tools are accessible from Git Bash.

### Linux (Debian)

- Install [QEMU](https://www.qemu.org/download/#linux)

    ```bash
    sudo apt install qemu-kvm qemu-system qemu-utils -y
    ```

- Ensure KVM is usable

    ```bash
    sudo apt install cpu-checker
    kvm-ok
    ```

- Install Lima

    ```bash
    VERSION=$(curl -fsSL https://api.github.com/repos/lima-vm/lima/releases/latest | jq -r .tag_name)
    curl -fsSL "https://github.com/lima-vm/lima/releases/download/${VERSION}/lima-${VERSION:1}-$(uname -s)-$(uname -m).tar.gz" | tar Cxzvm /usr/local
    ```

### MacOS

- Install QEMU and Lima

    ```bash
    brew install qemu lima
    ```

## Run the Pre-built Lima VMs

1. Install the prerequisites for your platform.

1. Use the provided `labenv.yaml` (adjust paths as needed)

    ```bash
    # Start the VM from YAML template
    limactl start ./labenv.yaml # Press enter to proceed

    # Watch boot logs in another terminal
    tail -f ~/.lima/labenv/serial*.log
    ```

1. Troubleshooting (check `limactl -h`)

    ```bash
    limactl list           # List VMs
    limactl shell labenv   # SSH into the VM
    limactl restart labenv # Restart the VM
    limactl stop labenv    # Stop the VM
    limactl delete labenv  # Delete the VM
    limactl prune          # Prune garbage objects
    limactl start-at-login --enabled false # Disable VM autostart
    ```

## Cross-Platform VM Deployment

> A Vagrant box for `labenv` is provided as a fallback option for environments where hardware-accelerated VMs cannot be used.

1. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads) and [Vagrant](https://developer.hashicorp.com/vagrant/install) for your platform.

1. Download the box from [Release](https://github.com/Sh3b0/interactive-labs/releases/tag/boxes) page.

1. Import the downloaded box to Vagrant.

    ```bash
    vagrant box add --name labenv --version 1.0.0 --provider virtualbox ./labenv-virtualbox-amd64.box
    ```

1. Use the provided [Vagrantfile](./Vagrantfile) to run the VM. Access at `http://<VM-IP>:3000`

    ```bash
    vagrant up --provider virtualbox
    ```

## Build Your Own Image

1. Install [d2vm](https://github.com/linka-cloud/d2vm/releases/) for your platform.

1. Build docker image for a local `labenv:vm-amd64` and/or `labenv:vm-arm64` using a [Dockerfile](./build/Dockerfile)

    ```bash
    docker buildx create --name mybuilder --use
    
    docker buildx build --platform linux/amd64 -t labenv:vm-amd64 --load .
    
    docker buildx build --platform linux/arm64 -t labenv:vm-arm64 --load .
    ```

1. Create VM disk image from the docker image with d2vm. See `d2vm convert --help` for details.

    ```bash
    d2vm convert \
        --platform linux/amd64 \
        --bootloader grub \
        --network-manager netplan \
        --size 20G \
        --password vagrant \
        --output labenv-amd64.qcow2 \
        labenv:vm-amd64

    d2vm convert \
        --platform linux/amd64 \
        --bootloader grub-efi \
        --network-manager netplan \
        --size 20G \
        --password vagrant \
        --output labenv-arm64.qcow2 \
        labenv:vm-arm64
    ```

1. To create a Vagrant Box for usage with VirtualBox, obtain a `vmdk` disk image with `qemu-img convert` and `tar` it alongside the files from the provided `virtualbox` directory (adjust as needed).

    ```bash
    cd virtualbox
    qemu-img convert -O vmdk ../labenv-amd64.qcow2 box.vmdk
    tar czfv labenv-virtualbox-amd64.box ./*
    ```
