# Versión 2026.11.09 (2026-11-19)

## What's Changed
* ⬆️ Update louislam/uptime-kuma to v2.5.12 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/71


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.11.08...2026.11.09

# Versión 2026.11.08 (2026-11-16)

- Sustituye `sipsak` por una prueba SIP que envía un único `OPTIONS` y no reintenta la autenticación con contraseña vacía al recibir `401`.
- Añade «Usuario PJSIP (From)» al monitor para identificar una extensión existente de FreePBX. Los monitores SIP anteriores deben completar este campo antes de reanudarse.
- Utiliza el mismo puerto UDP para envío y recepción, con `rport`, y acepta cualquier respuesta final SIP 2xx–6xx como señal de que el servicio responde.
- Elimina el aviso incorrecto de que este monitor no funciona dentro del contenedor.
- Conserva datos, Ingress y el puerto configurable 3001.

# Versión 2026.11.07 (2026-11-16)

- El monitor SIP Options indica «responde» ante cualquier respuesta SIP final válida (2xx–6xx), como 200, 401 o 403; muestra el código recibido.
- Si no llega una respuesta SIP válida, informa de un error más claro para investigar timeout, firewall o servicio.
- Elimina el aviso de que sipsak no funciona en Docker, ya que el add-on lo incluye.
- Conserva los monitores existentes; Ingress y el puerto 3001 no cambian.

**Cambios completos**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.11.06...2026.11.07

# Versión 2026.11.06 (2026-11-16)

- Habilita el monitor SIP Options en el add-on y añade sipsak para comprobar SIP por UDP, incluido el puerto 5060.
- Kuma considera disponible el servidor cuando responde 200 OK a SIP OPTIONS.
- Mantiene Ingress, el puerto configurable 3001 y los monitores existentes.
- Añade una prueba real de SIP OPTIONS sobre UDP y documentación de uso.

**Cambios completos**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.11.05...2026.11.06

# Versión 2026.11.05 (2026-11-12)

## What's Changed
* ⬆️ Update louislam/uptime-kuma to v2.5.11 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/62


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.11.04...2026.11.05

# Versión 2026.11.04 (2026-11-11)

## What's Changed
* ⬆️ Update paho-mqtt to v2.2.0 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/58
* ⬆️ Update ghcr.io/hassio-addons/base Docker tag to v21.0.11 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/60
* ⬆️ Update ubuntu to v26 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/56
* ⬆️ Update apprise to v2.2.0 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/59


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.11.03...2026.11.04

# Versión 2026.11.03 (2026-11-04)

- Recupera el puerto HTTP/Socket.IO 3001 para la integración de Kuma, configurable desde Configuración → Red.
- Conserva Ingress en 8099 y el acceso desde el panel de Home Assistant.
- Separa el backend privado en 127.0.0.1:3002 y adapta las rutas también para el acceso directo.
- Mantiene usuarios, monitores, historial y OTP. El acceso directo no pasa por la autenticación de HA.
- Añade pruebas del puerto directo, remapeo al host y autenticación tras actualizar.

# Versión 2026.11.02 (2026-11-02)

## Ingress para la instalación existente

- Añade acceso desde el panel de Home Assistant mediante Ingress, con las correcciones probadas en la preview 0.1.1.
- Conserva el slug `uptime-kuma-cfm`, la carpeta `/data` y Uptime Kuma 2.5.9. Se reutilizan los datos del add-on original.
- Mantiene la autenticación y OTP de Kuma; adapta rutas, recursos y WebSocket al prefijo de Ingress.
- Incluye pruebas de navegador, restricciones de acceso y conservación de datos al actualizar desde 2026.11.01.

## Cambio incompatible de acceso

El puerto 3001 deja de publicarse. Usa **Abrir interfaz web** o la barra lateral de Home Assistant. Los iframes de la URL antigua, páginas públicas, llamadas externas a API/métricas/push y descubrimiento por URL directa dejan de estar disponibles. Se elimina el ejecutable de Cloudflare Tunnel. Esta edición está orientada al uso privado mediante Home Assistant.

Haz una copia de seguridad antes de actualizar. No desinstales el add-on original. La preview local tiene datos separados y no se migra automáticamente.

# Versión 2026.11.01 (2026-11-01)

## What's Changed
* ⬆️ Update alpine_3_24/nodejs to v24.22.1-r1 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/51
* ⬆️ Update cloudflare/cloudflared to v2026.10.7 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/50
* ⬆️ Update louislam/uptime-kuma to v2.5.9 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/52


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.10.04...2026.11.01

# Versión 2026.10.04 (2026-10-28)

## What's Changed
* ⬆️ Update cloudflare/cloudflared to v2026.10.4 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/44
* ⬆️ Update apprise to v2.1.0 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/43
* ⬆️ Update ghcr.io/hassio-addons/base Docker tag to v21.0.10 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/45
* ⬆️ Update louislam/uptime-kuma to v2.5.8 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/46
* ⬆️ Update cloudflare/cloudflared to v2026.10.5 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/47
* Specify version for python3 in Dockerfile by @carferrer in https://github.com/carferrer/uptime-kuma-cfm/pull/48


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.10.03...2026.10.04

# Versión 2026.10.03 (2026-10-23)

## What's Changed
* ⬆️ Update ghcr.io/hassio-addons/base Docker tag to v21.0.9 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/39
* ⬆️ Update alpine_3_24/nodejs to v24.22.1-r0 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/41
* ⬆️ Update louislam/uptime-kuma to v2.5.7 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/40


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.10.02...2026.10.03

# Versión 2026.10.02 (2026-10-21)

## What's Changed
* ⬆️ Update cloudflare/cloudflared to v2026.10.3 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/37
* ⬆️ Update louislam/uptime-kuma to v2.5.6 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/36


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.10.01...2026.10.02

# Versión 2026.10.01 (2026-10-08)

## What's Changed
* Update Python3 installation in Dockerfile by @carferrer in https://github.com/carferrer/uptime-kuma-cfm/pull/34
* ⬆️ Update cloudflare/cloudflared to v2026.10.0 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/30
* ⬆️ Update apprise to v2 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/31
* ⬆️ Update ghcr.io/hassio-addons/base Docker tag to v21.0.8 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/32


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.09.04...2026.10.01

# Versión 2026.09.04 (2026-09-16)

## What's Changed
* ⬆️ Pin dependencies by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/24
* ci: build add-on images on pull requests by @carferrer in https://github.com/carferrer/uptime-kuma-cfm/pull/26
* ci: automate release preparation and publishing by @carferrer in https://github.com/carferrer/uptime-kuma-cfm/pull/28
* ⬆️ Update ghcr.io/hassio-addons/base Docker tag to v21.0.5 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/25
* ⬆️ Update louislam/uptime-kuma to v2.5.5 - autoclosed by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/27

## New Contributors
* @carferrer made their first contribution in https://github.com/carferrer/uptime-kuma-cfm/pull/26

**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.09.03...2026.09.04

# Versión 2026.09.03 (2026-09-14)

**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.09.02...2026.09.03

# Versión 2026.09.02 (2026-09-14)

## What's Changed
* Update setpriv APK package to v2.42.3-r1 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/22
* Update nodejs APK package to v24.18.1-r2 - autoclosed by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/21


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.09.01...2026.09.02

# Versión 2026.09.01 (2026-09-14)

## What's Changed
* Configure Renovate by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/15
* Update ghcr.io/hassio-addons/base Docker tag to v21.0.5 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/16
* Update dependency apprise to v1.13.1 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/17
* Update dependency cloudflare/cloudflared to v2026.9.1 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/20
* Update dependency louislam/uptime-kuma to v2.5.4 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/19


**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.08.33...2026.09.01

# Versión 2026.09.01 (2026-09-14)

## What's Changed
* Configure Renovate by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/15
* Update ghcr.io/hassio-addons/base Docker tag to v21.0.5 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/16
* Update dependency apprise to v1.13.1 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/17
* Update dependency cloudflare/cloudflared to v2026.9.1 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/20
* Update dependency louislam/uptime-kuma to v2.5.4 by @renovate[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/19

## New Contributors
* @renovate[bot] made their first contribution in https://github.com/carferrer/uptime-kuma-cfm/pull/15

**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.08.33...2026.09.01

# Versión 2026.08.33 (2026-08-24)

**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.08.32...2026.08.33

# Versión 2026.08.32 (2026-08-24)

## What's Changed
* Bump actions/checkout from 5 to 7 by @dependabot[bot] in https://github.com/carferrer/uptime-kuma-cfm/pull/1

## New Contributors
* @dependabot[bot] made their first contribution in https://github.com/carferrer/uptime-kuma-cfm/pull/1

**Full Changelog**: https://github.com/carferrer/uptime-kuma-cfm/compare/2026.08.31...2026.08.32

# Versión 2026.08.31 (2026-08-08)

Arreglo changelog action

# Versión  (2026-08-08)
