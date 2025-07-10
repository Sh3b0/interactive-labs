#syntax=docker/dockerfile:1.3-labs

FROM kubernetesui/dashboard:v2.7.0 AS k8s-console

FROM ubuntu:24.04 AS system-base

ENV DEBIAN_FRONTEND=noninteractive \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        apt-transport-https \
        bash-completion \
        build-essential \
        buildah \
        cadaver \
        docker.io \
        findutils \
        fuse3 \
        gettext \
        git \
        locales \
        apache2 \
        apache2-dev \
        httpie \
        jq \
        less \
        make \
        nano \
        netcat-openbsd \
        nodejs \
        npm \
        curl \
        virtualenv \
        asciinema \
        ca-certificates \
        fish \
        openssh-server \
        libdigest-sha-perl \
        procps \
        python3 \
        python3-dev \
        python3-pip \
        python3-venv \
        python3-wheel \
        siege \
        slirp4netns \
        skopeo \
        supervisor \
        sudo \
        tree \
        tmux \
        vim \
        which \
        yarn \
        zlib1g-dev; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*; \
    mkdir -p /home/eduk8s && \
    chown -R 1001:0 /home/eduk8s && \
    chmod -R g=u /home/eduk8s && \
    chmod g+w /etc/passwd && \
    chown 1001:0 /opt && \
    ln -s /var/run/docker/docker.sock /var/run/docker.sock

FROM system-base AS vscode-helper

COPY opt/helper /opt/helper

WORKDIR /opt/helper

RUN npm install && \
    npm run vsce-package

FROM golang:1.19-buster as builder-image

WORKDIR /app

RUN curl --silent --fail -L -o /tmp/git-serve.tar.gz https://github.com/cirocosta/git-serve/archive/refs/tags/v0.0.5.tar.gz && \
echo "09cd14a34f17d88cd4f0d2b73e0bbd0bf56984be21bc947f416a7824a709011e /tmp/git-serve.tar.gz" | sha256sum --check --status && \
    tar xvf /tmp/git-serve.tar.gz && \
    cd git-serve-0.0.5 && \
    go mod download && \
    go build -o git-serve cmd/git-serve/main.go

FROM system-base AS scratch-image

ARG TARGETARCH

# Kubernetes web console.

COPY --from=k8s-console / /opt/console/

# Miscellaneous tools.

SHELL ["/bin/bash", "-c"]

RUN <<EOF
    BOMBARDIER_VERSION=1.2.6
    CHECKSUM_amd64="c29be68fb6711434d50d8c25bc5ce08d33d8265871e6e1a518b3775e530fbb9b"
    CHECKSUM_arm64="3064a2c7639b8f4c682895cbd8f7791c272200066d68837591e3204988cd6190"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /usr/local/bin/bombardier https://github.com/codesenberg/bombardier/releases/download/v${BOMBARDIER_VERSION}/bombardier-linux-${TARGETARCH}
    echo "${!CHECKSUM}  /usr/local/bin/bombardier" | sha256sum --check --status
    chmod +x /usr/local/bin/bombardier
EOF

RUN <<EOF
    YQ_VERSION=4.45.1
    CHECKSUM_amd64="654d2943ca1d3be2024089eb4f270f4070f491a0610481d128509b2834870049"
    CHECKSUM_arm64="ceea73d4c86f2e5c91926ee0639157121f5360da42beeb8357783d79c2cc6a1d"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /usr/local/bin/yq https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_${TARGETARCH}
    echo "${!CHECKSUM} /usr/local/bin/yq" | sha256sum --check --status
    chmod +x /usr/local/bin/yq
EOF

RUN <<EOF
    HUGO_VERSION=0.144.1
    CHECKSUM_amd64="8ff8490aa292e1d56121e9a6ce7bd1623e98b3b0f0c652a4a5035316f100a0d2"
    CHECKSUM_arm64="b6529d6ec236ee7d09018462a456a2cda17e4db21b6551a4224edad9cc2808b9"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/hugo.tar.gz https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/hugo.tar.gz" | sha256sum --check --status
    cd /usr/local/bin
    tar -zxf /tmp/hugo.tar.gz hugo
    rm /tmp/hugo.tar.gz
EOF

RUN <<EOF
    DIVE_VERSION=0.12.0
    CHECKSUM_amd64="20a7966523a0905f950c4fbf26471734420d6788cfffcd4a8c4bc972fded3e96"
    CHECKSUM_arm64="a2a1470302cdfa367a48f80b67bbf11c0cd8039af9211e39515bd2bbbda58fea"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/dive.tar.gz https://github.com/wagoodman/dive/releases/download/v${DIVE_VERSION}/dive_${DIVE_VERSION}_linux_${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/dive.tar.gz" | sha256sum --check --status
    tar -C /usr/local/bin -zxvf /tmp/dive.tar.gz dive
    rm /tmp/dive.tar.gz
EOF

RUN <<EOF
    UV_VERSION=0.6.6
    ARCHNAME_amd64=x86_64
    ARCHNAME_arm64=aarch64
    ARCHNAME=ARCHNAME_${TARGETARCH}
    CHECKSUM_amd64="16667b429a57ee917b10093e81e52956e4c19f9fd73d05dd87c3cbc27779ac7e"
    CHECKSUM_arm64="37a543598cdb7d8fc9b74e6b1fe1fdf8b9a279c6137c7ff8396a88f69ec7a43c"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/uv.tar.gz https://github.com/astral-sh/uv/releases/download/${UV_VERSION}/uv-${!ARCHNAME}-unknown-linux-gnu.tar.gz
    tar -C /usr/local/bin --strip-components 1 -xf /tmp/uv.tar.gz uv-${!ARCHNAME}-unknown-linux-gnu/uv uv-${!ARCHNAME}-unknown-linux-gnu/uvx
    rm -f /tmp/uv.tar.gz
EOF

# Kubernetes tools.

RUN mkdir -p /opt/kubernetes/bin

RUN <<EOF
    KUBECTL_VERSION=1.30.10
    KUBECTL_SHORT_VERSION=$(echo ${KUBECTL_VERSION} | cut -d. -f1,2)
    CHECKSUM_amd64="1d575cf29fc6514565ef76329f2b7008a3d7c7e7dfa853a70e9bd65784b653a3338260325c2a7bc8e80427cb3829bf6407aba6a39fb4bf73c30da775d3aad2c8"
    CHECKSUM_arm64="3111d0842d92a1b26d6115d9346b780d3552732d46ee233f7ffb34122b50addb0717032cf85a6ff80317d0ad88e3b4fd7f16628cad2d7a53eadf971fa8da0244"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz https://dl.k8s.io/v${KUBECTL_VERSION}/kubernetes-client-linux-${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz" | sha512sum --check --status
    tar -C /tmp -zxf /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz
    mv /tmp/kubernetes/client/bin/kubectl /opt/kubernetes/bin/kubectl@${KUBECTL_SHORT_VERSION}
    mv /tmp/kubernetes/client/bin/kubectl-convert /opt/kubernetes/bin/kubectl-convert@${KUBECTL_SHORT_VERSION}
    rm -f /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz
    rm -rf /tmp/kubernetes
EOF

RUN <<EOF
    KUBECTL_VERSION=1.31.6
    KUBECTL_SHORT_VERSION=$(echo ${KUBECTL_VERSION} | cut -d. -f1,2)
    CHECKSUM_amd64="dd3d8723e7ff54aa4c8a1087d961c8f604b8dce5a6981357daea9b8e1882efbfaf9e226afc35cdc277e2ac06f6ef3bd9867c21158d9ae917d02ade7c245f8610"
    CHECKSUM_arm64="6fef05cf595f6d10a355670b2509ae4aa85d036bb6793624e8a3362fbacc22825b410f852665b83c91c1e10c4d11a539ad8d695fc257808cd5198fd53c39a7be"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz https://dl.k8s.io/v${KUBECTL_VERSION}/kubernetes-client-linux-${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz" | sha512sum --check --status
    tar -C /tmp -zxf /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz
    mv /tmp/kubernetes/client/bin/kubectl /opt/kubernetes/bin/kubectl@${KUBECTL_SHORT_VERSION}
    mv /tmp/kubernetes/client/bin/kubectl-convert /opt/kubernetes/bin/kubectl-convert@${KUBECTL_SHORT_VERSION}
    rm -f /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz
    rm -rf /tmp/kubernetes
EOF

RUN <<EOF
    KUBECTL_VERSION=1.32.2
    KUBECTL_SHORT_VERSION=$(echo ${KUBECTL_VERSION} | cut -d. -f1,2)
    CHECKSUM_amd64="0f27d1918088df6a672f42b13cf213acb5e7499db1b9db5191478adb2ca0c350ba8f5004ceee3798b0ff47fc358bf2fb37097c1113f603dbedd0d00ae0dbaf7f"
    CHECKSUM_arm64="ad0af31c2845e80fcc1916b550b6047a42bd01971f5a20256d98bdd59b51d03061607898cf190365a484a169d411a5b3d46aa8365ec3e035fb98fd345fb04c09"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz https://dl.k8s.io/v${KUBECTL_VERSION}/kubernetes-client-linux-${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz" | sha512sum --check --status
    tar -C /tmp -zxf /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz
    mv /tmp/kubernetes/client/bin/kubectl /opt/kubernetes/bin/kubectl@${KUBECTL_SHORT_VERSION}
    mv /tmp/kubernetes/client/bin/kubectl-convert /opt/kubernetes/bin/kubectl-convert@${KUBECTL_SHORT_VERSION}
    rm -f /tmp/kubernetes-client-linux-${TARGETARCH}.tar.gz
    rm -rf /tmp/kubernetes
EOF

RUN <<EOF
    K9S_VERSION=0.40.5
    CHECKSUM_amd64="63dcf6817b2c391ccb4a8b7ee313f5990f5accfa0e55a72c769b73c303a03e01"
    CHECKSUM_arm64="3e3c852b3f7604c14e96dfb56b869769c2c314fdad8d4c35ab158c738c516a22"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/k9s.tar.gz https://github.com/derailed/k9s/releases/download/v${K9S_VERSION}/k9s_Linux_${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/k9s.tar.gz" | sha256sum --check --status
    tar -C /tmp -zxf /tmp/k9s.tar.gz k9s
    mv /tmp/k9s /opt/kubernetes/bin/k9s
    rm /tmp/k9s.tar.gz
EOF

RUN <<EOF
    YTT_VERSION=0.51.1
    CHECKSUM_amd64="026a12ee7108ff2d1150eb1347d544367d92e993ade7b2d2727c4c8d13a47a6b"
    CHECKSUM_arm64="55849cab41cf7780b0d26da416395cf77576a434a4bcf883b0e2a29944325e7c"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /opt/kubernetes/bin/ytt https://github.com/carvel-dev/ytt/releases/download/v${YTT_VERSION}/ytt-linux-${TARGETARCH}
    echo "${!CHECKSUM} /opt/kubernetes/bin/ytt" | sha256sum --check --status
    chmod +x /opt/kubernetes/bin/ytt
EOF

RUN <<EOF
    IMGPKG_VERSION=0.44.0
    CHECKSUM_amd64="15ca4f8ec4c7a1c6ecf06740a942149887a73845565f0ffbf6ccbf013b65a58a"
    CHECKSUM_arm64="f772b6eb10654f45d15d2166d5be81cf18529aece59df906c25dcb364f508ebe"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /opt/kubernetes/bin/imgpkg https://github.com/carvel-dev/imgpkg/releases/download/v${IMGPKG_VERSION}/imgpkg-linux-${TARGETARCH}
    echo "${!CHECKSUM} /opt/kubernetes/bin/imgpkg" | sha256sum --check --status
    chmod +x /opt/kubernetes/bin/imgpkg
EOF

RUN <<EOF
    KBLD_VERSION=0.45.0
    CHECKSUM_amd64="e076af83ef05765e6bf825f2bf5ac31c365cc0d513b7317bd634f3b9c6b5ee5d"
    CHECKSUM_arm64="9e52c553322fa21a8af10d47d76c66eb7a2f406fad92bb589458554cb4143121"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /opt/kubernetes/bin/kbld https://github.com/carvel-dev/kbld/releases/download/v${KBLD_VERSION}/kbld-linux-${TARGETARCH}
    echo "${!CHECKSUM} /opt/kubernetes/bin/kbld" | sha256sum --check --status
    chmod +x /opt/kubernetes/bin/kbld
EOF

RUN <<EOF
    KAPP_VERSION=0.64.0
    CHECKSUM_amd64="14207d33130e833d201f2cd6e3e87435fb8b9534298843ed3c00fe7cda5221df"
    CHECKSUM_arm64="fc7617107fa87480e6326c1cdf2c62708f455c9d96f8e9550fb5e848c296cc80"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /opt/kubernetes/bin/kapp https://github.com/carvel-dev/kapp/releases/download/v${KAPP_VERSION}/kapp-linux-${TARGETARCH}
    echo "${!CHECKSUM} /opt/kubernetes/bin/kapp" | sha256sum --check --status
    chmod +x /opt/kubernetes/bin/kapp
EOF

RUN <<EOF
    KWT_VERSION=0.0.8
    CHECKSUM_amd64="1022483a8b59fe238e782a9138f1fee6ca61ecf7ccd1e5f0d98e95c56df94d87"
    CHECKSUM_arm64="7b94a134cbde5ff2e245d102f54b9ac9f81b3fcc5e54a5cefecc1e5845b8a65f"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /opt/kubernetes/bin/kwt https://github.com/carvel-dev/kwt/releases/download/v${KWT_VERSION}/kwt-linux-${TARGETARCH}
    echo "${!CHECKSUM} /opt/kubernetes/bin/kwt" | sha256sum --check --status
    chmod +x /opt/kubernetes/bin/kwt
EOF

RUN <<EOF
    VENDIR_VERSION=0.43.0
    CHECKSUM_amd64="3d31f00efc0a11a8dfcf662d45a120d18f99105d1502bbfe12a6cbd9d0b1f570"
    CHECKSUM_arm64="0895efdc3fe36f37035ce96169e8cc335a103adcfe02092fcc29f514be8867e7"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /opt/kubernetes/bin/vendir https://github.com/carvel-dev/vendir/releases/download/v${VENDIR_VERSION}/vendir-linux-${TARGETARCH}
    echo "${!CHECKSUM} /opt/kubernetes/bin/vendir" | sha256sum --check --status
    chmod +x /opt/kubernetes/bin/vendir
EOF

RUN <<EOF
    KCTRL_VERSION=0.55.1
    CHECKSUM_amd64="39dd9593f3a7435ea2a9014dd832b5c9ed1eb1aba52e22c2b6186a0170c52f34"
    CHECKSUM_arm64="234bcab23f6d8349855bf1dfd27dd0d1617ff2188034be8c37e984026893d9e1"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /opt/kubernetes/bin/kctrl https://github.com/carvel-dev/kapp-controller/releases/download/v${KCTRL_VERSION}/kctrl-linux-${TARGETARCH}
    echo "${!CHECKSUM} /opt/kubernetes/bin/kctrl" | sha256sum --check --status
    chmod +x /opt/kubernetes/bin/kctrl
EOF

RUN <<EOF
    OCTANT_VERSION=0.12.1
    ARCHNAME_amd64=64bit
    ARCHNAME_arm64=arm64
    ARCHNAME=ARCHNAME_${TARGETARCH}
    CHECKSUM_amd64="b56ca09fb92314eb6a7b1a0ddcc65b582990e3fdef6e2a996cacd4a24b4e54bf"
    CHECKSUM_arm64="2808448a78d7c55e40ed34bcd3cd4db04b5cf847884938af047b73eb7a40bcd5"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/octant.tar.gz https://github.com/vmware-tanzu/octant/releases/download/v${OCTANT_VERSION}/octant_${OCTANT_VERSION}_Linux-${!ARCHNAME}.tar.gz
    tar -C /opt/kubernetes/bin --strip-components 1 -xf /tmp/octant.tar.gz octant_${OCTANT_VERSION}_Linux-${!ARCHNAME}/octant
    mv /opt/kubernetes/bin/octant /opt/kubernetes/bin/octant@${OCTANT_VERSION}
    rm -f /tmp/octant.tar.gz
EOF

RUN <<EOF
    OCTANT_VERSION=0.25.1
    ARCHNAME_amd64=64bit
    ARCHNAME_arm64=arm64
    ARCHNAME=ARCHNAME_${TARGETARCH}
    CHECKSUM_amd64="b12bb6752e43f4e0fe54278df8e98dee3439c4066f66cdb7a0ca4a1c7d8eaa1e"
    CHECKSUM_arm64="a3eb4973a0c869267e3916bd43e0b41b2bbc73b898376b795a617299c7b2a623"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/octant.tar.gz https://github.com/vmware-tanzu/octant/releases/download/v${OCTANT_VERSION}/octant_${OCTANT_VERSION}_Linux-${!ARCHNAME}.tar.gz
    tar -C /opt/kubernetes/bin --strip-components 1 -xf /tmp/octant.tar.gz octant_${OCTANT_VERSION}_Linux-${!ARCHNAME}/octant
    mv /opt/kubernetes/bin/octant /opt/kubernetes/bin/octant@${OCTANT_VERSION}
    ln -s octant@${OCTANT_VERSION} /opt/kubernetes/bin/octant@latest
    rm -f /tmp/octant.tar.gz
EOF

RUN <<EOF
    HELM_VERSION=3.17.1
    CHECKSUM_amd64="3b66f3cd28409f29832b1b35b43d9922959a32d795003149707fea84cbcd4469"
    CHECKSUM_arm64="c86c9b23602d4abbfae39d9634e25ab1d0ea6c4c16c5b154113efe316a402547"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/helm.tar.gz https://get.helm.sh/helm-v${HELM_VERSION}-linux-${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/helm.tar.gz" | sha256sum --check --status
    tar -C /opt/kubernetes/bin --strip-components 1 -zxvf /tmp/helm.tar.gz linux-${TARGETARCH}/helm
    rm /tmp/helm.tar.gz
EOF

RUN <<EOF
    SKAFFOLD_VERSION=2.14.1
    CHECKSUM_amd64="e66836d51a0898ad618409404a9adfa045594a3c0234143c5d34e78f0e12c7c1"
    CHECKSUM_arm64="ef92ae3015d5331cabaee384b24fdd950f5c84c6729beb2604f2b637f6f535d8"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /opt/kubernetes/bin/skaffold https://github.com/GoogleContainerTools/skaffold/releases/download/v${SKAFFOLD_VERSION}/skaffold-linux-${TARGETARCH}
    echo "${!CHECKSUM} /opt/kubernetes/bin/skaffold" | sha256sum --check --status
    chmod +x /opt/kubernetes/bin/skaffold
EOF

RUN <<EOF
    KUSTOMIZE_VERSION=5.6.0
    CHECKSUM_amd64="54e4031ddc4e7fc59e408da29e7c646e8e57b8088c51b84b3df0864f47b5148f"
    CHECKSUM_arm64="ad8ab62d4f6d59a8afda0eec4ba2e5cd2f86bf1afeea4b78d06daac945eb0660"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    curl --silent --fail -L -o /tmp/kustomize.tar.gz https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize/v${KUSTOMIZE_VERSION}/kustomize_v${KUSTOMIZE_VERSION}_linux_${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/kustomize.tar.gz" | sha256sum --check --status
    tar -C /opt/kubernetes/bin -zxvf /tmp/kustomize.tar.gz kustomize
    rm /tmp/kustomize.tar.gz
EOF

# VS Code editor and dashboard extension.

RUN <<EOF
    CODE_VERSION=4.98.2
    CHECKSUM_amd64="592acabf2f16210f4aec62d0390b2e3a392b7013068f97de72a14ce87d4279ff"
    CHECKSUM_arm64="bf31ba7e59c1ef3fc6a131adb3723812a0d41e971ba959bb2aa85b7a3ed27550"
    CHECKSUM=CHECKSUM_${TARGETARCH}
    set -eo pipefail
    mkdir /opt/editor
    curl --silent --fail -L -o /tmp/code-server.tar.gz https://github.com/cdr/code-server/releases/download/v${CODE_VERSION}/code-server-${CODE_VERSION}-linux-${TARGETARCH}.tar.gz
    echo "${!CHECKSUM} /tmp/code-server.tar.gz" | sha256sum --check --status
    cd /opt/editor
    tar -zxf /tmp/code-server.tar.gz --strip-components=1
    rm /tmp/code-server.tar.gz
EOF

COPY --from=vscode-helper --chown=1001:0 /opt/helper/educates-0.0.1.vsix /opt/eduk8s/educates-0.0.1.vsix

# Git server.

RUN mkdir /opt/git /opt/git/bin /opt/git/repositories

COPY --from=builder-image /app/git-serve-0.0.5/git-serve /opt/git/bin/git-serve

# Dashboard applications.

COPY opt/. /opt/

RUN mkdir -p /opt/slides/reveal.js/3.9.2 && \
    cd /opt/slides/reveal.js/3.9.2 && \
    curl -sL -o src.tar.gz https://github.com/hakimel/reveal.js/archive/3.9.2.tar.gz && \
    tar --strip-components 1 -xf src.tar.gz && \
    rm src.tar.gz && \
    mkdir -p /opt/slides/reveal.js/4.6.0 && \
    cd /opt/slides/reveal.js/4.6.0 && \
    curl -sL -o src.tar.gz https://github.com/hakimel/reveal.js/archive/4.6.0.tar.gz && \
    tar --strip-components 1 -xf src.tar.gz && \
    rm src.tar.gz && \
    mkdir -p /opt/slides/reveal.js/5.1.0 && \
    cd /opt/slides/reveal.js/5.1.0 && \
    curl -sL -o src.tar.gz https://github.com/hakimel/reveal.js/archive/5.1.0.tar.gz && \
    tar --strip-components 1 -xf src.tar.gz && \
    rm src.tar.gz && \
    mkdir -p /opt/slides/impress.js/1.1.0 && \
    cd /opt/slides/impress.js/1.1.0 && \
    curl -sL -o src.tar.gz https://github.com/impress/impress.js/archive/refs/tags/1.1.0.tar.gz && \
    tar --strip-components 1 -xf src.tar.gz && \
    rm src.tar.gz && \
    mkdir -p /opt/slides/impress.js/2.0.0 && \
    cd /opt/slides/impress.js/2.0.0 && \
    curl -sL -o src.tar.gz https://github.com/impress/impress.js/archive/refs/tags/v2.0.0.tar.gz && \
    tar --strip-components 1 -xf src.tar.gz && \
    rm src.tar.gz

RUN cd /opt/httpd && \
    virtualenv /opt/httpd && \
    source /opt/httpd/bin/activate && \
    pip install --no-cache-dir -r requirements.txt

RUN cd /opt/gateway && \
    npm install && \
    npm run compile && \
    npm prune --production && \
    npm cache clean --force

RUN cd /opt/renderer && \
    npm install && \
    npm run compile && \
    npm prune --production && \
    npm cache clean --force

FROM system-base

ARG TARGETARCH

COPY --from=scratch-image --chown=1001:0 /opt/. /opt/
COPY --from=scratch-image --chown=1001:0 /home/. /home/

COPY --from=scratch-image /usr/local/. /usr/local/

COPY usr/. /usr/
COPY etc/. /etc/

COPY --chown=1001:0 home/. /home/

RUN ln -s /opt/eduk8s/etc/supervisord.conf /etc/supervisord.conf && fix-permissions /home/eduk8s

ENV HOME=/home/eduk8s \
    PATH=/home/eduk8s/bin:/opt/eduk8s/bin:/opt/kubernetes/bin:/opt/editor/bin:$PATH \
    PLATFORM_ARCH=${TARGETARCH}

ENV BASH_ENV=/opt/eduk8s/etc/profile \
    ENV=/opt/eduk8s/etc/profile \
    PROMPT_COMMAND=". /opt/eduk8s/etc/profile"

RUN useradd -ms /bin/bash eduk8s && \
    usermod -aG sudo eduk8s && \
    echo "eduk8s ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER eduk8s

WORKDIR /home/eduk8s

ENTRYPOINT [ "container-entrypoint" ]

EXPOSE 10081

CMD [ "start-container" ]
