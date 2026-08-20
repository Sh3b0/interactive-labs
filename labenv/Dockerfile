FROM buildpack-deps:noble

ENV DEBIAN_FRONTEND=noninteractive

# Install system packages
RUN <<EOT
apt-get update && yes | unminimize
apt-get install -y sudo man-db vim nano file jq unzip tree procps htop curl wget \
    iputils-ping netcat-openbsd telnet iproute2 net-tools tcpdump traceroute lsof \
    git lsb-release fish asciinema
apt-get clean -y && rm -rf /var/lib/apt/lists/*
EOT

# Install user tools
ENV NODEJS_VERSION=24.13.0
ENV DOCKER_CLI_VERSION=29.1.3
ENV DOCKER_COMPOSE_VERSION=v5.0.1
ENV CODE_SERVER_VERSION=4.108.0
ENV ZELLIJ_VERSION=0.43.1

ARG TARGETARCH

RUN <<-EOT
set -eux

if [ "$TARGETARCH" = "amd64" ]; then 
wget -q "https://nodejs.org/dist/v$NODEJS_VERSION/node-v$NODEJS_VERSION-linux-x64.tar.xz"
wget -q "https://download.docker.com/linux/static/stable/x86_64/docker-$DOCKER_CLI_VERSION.tgz"
wget -q "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-linux-x86_64"
wget -q "https://github.com/coder/code-server/releases/download/v$CODE_SERVER_VERSION/code-server-$CODE_SERVER_VERSION-linux-amd64.tar.gz"
wget -q "https://github.com/zellij-org/zellij/releases/download/v$ZELLIJ_VERSION/zellij-x86_64-unknown-linux-musl.tar.gz"

elif [ "$TARGETARCH" = "arm64" ]; then
wget -q "https://nodejs.org/dist/v$NODEJS_VERSION/node-v$NODEJS_VERSION-linux-arm64.tar.xz"
wget -q "https://download.docker.com/linux/static/stable/aarch64/docker-$DOCKER_CLI_VERSION.tgz"
wget -q "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-linux-aarch64"
wget -q "https://github.com/coder/code-server/releases/download/v$CODE_SERVER_VERSION/code-server-$CODE_SERVER_VERSION-linux-arm64.tar.gz"
wget -q "https://github.com/zellij-org/zellij/releases/download/v$ZELLIJ_VERSION/zellij-aarch64-unknown-linux-musl.tar.gz"
fi

tar -xJf node-* -C /usr/local --strip-components=1 --no-same-owner
tar -xzf docker-*.tgz && mv ./docker/* /usr/local/bin
mkdir -p /usr/local/lib/docker/cli-plugins && chmod +x docker-compose-* && mv docker-compose-* /usr/local/lib/docker/cli-plugins/docker-compose
tar -xzf code-server-* -C /usr/local/lib && ln -s /usr/local/lib/code-server-*/bin/code-server /usr/local/bin/code-server
tar -C /usr/local/bin/ -xzf zellij-*

rm -rf *.tar.xz *.tar.gz *.tgz /tmp/*
EOT

# Prepare user account
RUN <<-EOT
usermod -aG sudo ubuntu
echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
chsh -s /usr/bin/fish ubuntu
EOT

# Application setup
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
RUN chown -R ubuntu:ubuntu /app

# Wrap up
USER ubuntu
EXPOSE 3000 8080
CMD ["/app/scripts/cmd.sh"]
