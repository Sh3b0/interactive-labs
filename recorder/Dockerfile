FROM ubuntu:24.04

WORKDIR /app

RUN apt-get update && \
     apt-get install -y --no-install-recommends sudo ca-certificates asciinema nano fish && \
     rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash dev && echo "dev ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER dev

COPY . .

ENTRYPOINT [ "/app/entrypoint.sh" ]
