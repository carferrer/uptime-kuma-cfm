ARG BUILD_FROM=ghcr.io/hassio-addons/base:21.0.10
FROM ${BUILD_FROM}
WORKDIR /opt
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
# Keep this version aligned with the guarded source adaptations.
ARG UPTIME_KUMA_VERSION="2.5.9"
ARG BUILD_ARCH=amd64
COPY requirements.txt /opt/
COPY adaptation /opt/ingress-adaptation/
RUN apk add --no-cache 'musl>=1.2.6-r3' \
    && apk add --no-cache --virtual .build-dependencies build-base=0.5-r4 py3-pip=26.1.2-r0 \
    && apk add --no-cache iputils=20250605-r2 nodejs=24.22.1-r1 npm=11.12.1-r0 python3=3.14.10-r1 setpriv=2.42.3-r1 nginx \
    && mkdir -p /opt/uptime-kuma /run/nginx \
    && curl --fail --location --silent --show-error "https://github.com/louislam/uptime-kuma/archive/refs/tags/${UPTIME_KUMA_VERSION}.tar.gz" \
        | tar xz --strip-components=1 -C /opt/uptime-kuma \
    && cd /opt/uptime-kuma \
    && pip install -r /opt/requirements.txt \
    && node /opt/ingress-adaptation/apply.cjs /opt/uptime-kuma \
    && npm ci --no-audit --no-fund --no-update-notifier \
    && npm run build -- --base=./ \
    && node /opt/ingress-adaptation/prepare-dist.cjs /opt/uptime-kuma/dist \
    && npm prune --omit=dev --no-audit --no-fund \
    && npm cache clean --force \
    && apk del --no-cache --purge .build-dependencies
COPY rootfs /
RUN chmod +x /etc/s6-overlay/s6-rc.d/uptime-kuma/run \
    /etc/s6-overlay/s6-rc.d/uptime-kuma/finish \
    /etc/s6-overlay/s6-rc.d/nginx/run \
    /etc/s6-overlay/s6-rc.d/nginx/finish \
    && nginx -t
# No cloudflared binary: access is exclusively through Home Assistant Ingress.
# Kuma's own login/OTP and WebSocket origin checks remain enabled.


ARG BUILD_DATE
ARG BUILD_DESCRIPTION
ARG BUILD_NAME
ARG BUILD_REF
ARG BUILD_REPOSITORY
ARG BUILD_VERSION


# Labels
LABEL \
    io.hass.name="${BUILD_NAME}" \
    io.hass.description="${BUILD_DESCRIPTION}" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="Carlos <carferrermar@gmail.com>" \
    org.opencontainers.image.title="${BUILD_NAME}" \
    org.opencontainers.image.description="${BUILD_DESCRIPTION}" \
    org.opencontainers.image.vendor="Home Assistant Community Apps" \
    org.opencontainers.image.authors="Carlos <carferrermar@gmail.com>" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://github.com/carferrer" \
    org.opencontainers.image.source="https://github.com/${BUILD_REPOSITORY}" \
    org.opencontainers.image.documentation="https://github.com/${BUILD_REPOSITORY}/blob/main/README.md" \
    org.opencontainers.image.created=${BUILD_DATE} \
    org.opencontainers.image.revision=${BUILD_REF} \
    org.opencontainers.image.version=${BUILD_VERSION}
