ARG BUILD_FROM=ghcr.io/timmo001/container-base/amd64:stable
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Copy root filesystem
COPY rootfs /

# Copy application
COPY . /opt/app

# Set shell
SHELL ["/bin/ash", "-o", "pipefail", "-c"]

ARG BUILD_ARCH=amd64

# Install system
# hadolint ignore=DL3003,DL3018
RUN \
    set -o pipefail \
    \
    && apk add --no-cache --virtual .build-dependencies \
        g++=10.3.1_git20210424-r2	\
        make=4.3-r0	\
        nodejs-current=16.6.0-r0 \
        npm=7.17.0-r0 \
        python3-dev=3.9.5-r1 \
        yarn=1.22.10-r0 \
    \
    && cd /opt/app \
    && jq 'del(.optionalDependencies."node-hide-console-window")' package.json > new-package.json \
    && mv new-package.json package.json \
    && yarn install --pure-lockfile

# hadolint ignore=DL3003,DL3018
RUN \
    set -o pipefail \
    \
    && cd /opt/app \
    && yarn install --pure-lockfile \
    && yarn package \
    && cp out/ip-core /bin \
    \
    && mkdir -p /root/.local/share/ip-data \
    \
    && apk del --purge .build-dependencies \
    && rm -fr /tmp/*

# Build arguments
ARG BUILD_DATE
ARG BUILD_DESCRIPTION
ARG BUILD_NAME
ARG BUILD_REF
ARG BUILD_REPOSITORY
ARG BUILD_VERSION

# Labels
LABEL \
    maintainer="Aidan Timson <contact@timmo.xyz>" \
    org.opencontainers.image.title="${BUILD_NAME}" \
    org.opencontainers.image.description="${BUILD_DESCRIPTION}" \
    org.opencontainers.image.vendor="Timmo" \
    org.opencontainers.image.authors="Aidan Timson <contact@timmo.xyz>" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://timmo.dev" \
    org.opencontainers.image.source="https://github.com/${BUILD_REPOSITORY}" \
    org.opencontainers.image.documentation="https://github.com/${BUILD_REPOSITORY}/blob/main/README.md" \
    org.opencontainers.image.created=${BUILD_DATE} \
    org.opencontainers.image.revision=${BUILD_REF} \
    org.opencontainers.image.version=${BUILD_VERSION}
