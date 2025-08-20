FROM przemub/ubuntu-unminimized:24.04

RUN apt-get update && \
    apt-get install -y \
    sudo man-db vim nano wget fish asciinema xclip \
    netcat-openbsd telnet file iproute2 iptables tcpdump jq unzip \
    nodejs npm node-browserify uglifyjs\
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/terminal

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run compile && \
    npm prune --production && \
    npm cache clean --force

RUN useradd -m -s /usr/bin/fish dev && \
    usermod -aG sudo dev && \
    echo "dev ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER dev

RUN /usr/bin/fish -c 'set -U fish_greeting ""'

EXPOSE 10081

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:10081/ || exit 1

CMD ["npm", "run", "start"]