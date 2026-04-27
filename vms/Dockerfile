# Dockerfile used by d2vm to create disk images for Vagrant boxes

# Main differences with original Dockerfile:
# - this is not intended to run as a container
# - full docker daemon is installed (not just CLI tools)
# - application is not bundled, will be downloaded while provisioning (see provision.sh)

FROM buildpack-deps:noble

ENV DEBIAN_FRONTEND=noninteractive

ARG TARGETARCH

# Install system packages
RUN <<EOT
set -eux

apt-get update && yes | unminimize

apt-get install -y sudo man-db vim nano file jq unzip tree procps htop curl wget \
    iputils-ping netcat-openbsd telnet iproute2 net-tools tcpdump traceroute lsof dnsutils \
    git lsb-release fish asciinema docker.io docker-buildx openssh-server rsync \
    cloud-init qemu-guest-agent

if [ "$TARGETARCH" = "amd64" ]; then 
    apt-get install -y virtualbox-guest-utils
fi

apt-get clean -y && rm -rf /var/lib/apt/lists/* /var/cache/debconf/* /var/log/* /tmp/* /var/tmp/*
EOT

# Install user tools
ENV NODEJS_VERSION=24.13.0
ENV CODE_SERVER_VERSION=4.108.0
ENV DOCKER_COMPOSE_VERSION=v5.0.1
ENV ZELLIJ_VERSION=0.43.1

RUN <<-EOT
set -eux

if [ "$TARGETARCH" = "amd64" ]; then 
wget -q "https://nodejs.org/dist/v$NODEJS_VERSION/node-v$NODEJS_VERSION-linux-x64.tar.xz"
wget -q "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-linux-x86_64"
wget -q "https://github.com/coder/code-server/releases/download/v$CODE_SERVER_VERSION/code-server-$CODE_SERVER_VERSION-linux-amd64.tar.gz"
wget -q "https://github.com/zellij-org/zellij/releases/download/v$ZELLIJ_VERSION/zellij-x86_64-unknown-linux-musl.tar.gz"

elif [ "$TARGETARCH" = "arm64" ]; then
wget -q "https://nodejs.org/dist/v$NODEJS_VERSION/node-v$NODEJS_VERSION-linux-arm64.tar.xz"
wget -q "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-linux-aarch64"
wget -q "https://github.com/coder/code-server/releases/download/v$CODE_SERVER_VERSION/code-server-$CODE_SERVER_VERSION-linux-arm64.tar.gz"
wget -q "https://github.com/zellij-org/zellij/releases/download/v$ZELLIJ_VERSION/zellij-aarch64-unknown-linux-musl.tar.gz"
fi

tar -xJf node-* -C /usr/local --strip-components=1 --no-same-owner
mkdir -p /usr/local/lib/docker/cli-plugins && chmod +x docker-compose-* && mv docker-compose-* /usr/local/lib/docker/cli-plugins/docker-compose
tar -xzf code-server-* -C /usr/local/lib && ln -s /usr/local/lib/code-server-*/bin/code-server /usr/local/bin/code-server
tar -C /usr/local/bin/ -xzf zellij-*

rm -rf *.tar.xz *.tar.gz *.tgz /tmp/*
EOT

COPY labenv.service /etc/systemd/system/labenv.service
COPY ../labenv /app/

RUN <<-EOT
set -eux

# Prepare user account
echo "ubuntu:ubuntu" | chpasswd
usermod -aG sudo ubuntu
usermod -aG docker ubuntu
echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
chsh -s /usr/bin/fish ubuntu

# Fixes for some 'Name or service not known' errors
echo "127.0.0.1  localhost.localdomain" >> /etc/hosts
echo "127.0.0.1  lima-labenv" >> /etc/hosts

# Installing npm dependencies and building the app
cd /app && npm ci

# Fixing script permissions
chmod +x /app/scripts/*

# Enabling labenv service for startup
systemctl enable labenv

# Preparing browser container
docker network create lab_net || true
docker pull -q jlesage/firefox:v26.01.1
EOT
