FROM fedora:41

RUN INSTALL_PKGS=" \
        findutils \
        gcc \
        glibc-langpack-en \
        httpd-devel \
        just \
        procps \
        python3-devel \
        python3-uv \
        redhat-rpm-config \
        sqlite \
        which \
    " && \
    dnf install -y --setopt=tsflags=nodocs $INSTALL_PKGS && \
    dnf clean -y --enablerepo='*' all && \
    useradd -u 1001 -g 0 -M -d /opt/app-root/src default && \
    mkdir -p /opt/app-root/src && \
    chown -R 1001:0 /opt/app-root

WORKDIR /opt/app-root

ENV PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=UTF-8 \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8

USER 1001

ENV PATH=/opt/app-root/bin:/opt/app-root/venv/bin:$PATH

COPY --chown=1001:0 ./ /opt/app-root

RUN just build-app

CMD [ "/opt/app-root/start-app.sh" ]

EXPOSE 8080
