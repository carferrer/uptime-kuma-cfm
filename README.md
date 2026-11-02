# Uptime Kuma para Home Assistant

Monitorización privada con Uptime Kuma 2.5.9, accesible desde **Abrir interfaz web** o el panel lateral de Home Assistant mediante Ingress.

## Actualizar desde 2026.11.01

1. Crea una copia de seguridad del add-on original antes de actualizar.
2. Actualiza **Uptime Kuma** a **2026.11.02** y arráncalo.
3. Abre **Abrir interfaz web** y entra con tu usuario y OTP de Kuma. Puedes activar **Mostrar en la barra lateral**.

La actualización conserva el identificador `uptime-kuma-cfm` y el directorio `/data`. No reinicializa ni copia la base de datos: utiliza la existente, con sus usuarios, monitores, historial, notificaciones y OTP. No desinstales el add-on original.

La versión local **Uptime Kuma Ingress Preview** es otro add-on y tiene datos independientes. Sus monitores de prueba no se trasladan al original.

## Cambio de acceso

Desde 2026.11.02 no se publica el puerto 3001. Kuma escucha únicamente en la dirección local del contenedor; nginx permite el acceso al puerto interno 8099 desde el Supervisor. Se retiran el descubrimiento de la URL directa y el ejecutable de Cloudflare Tunnel.

La antigua URL del proxy y los iframes que apuntan a ella dejan de funcionar. Usa el panel oficial de Ingress; no guardes una URL `/api/hassio_ingress/...` en un iframe porque contiene una sesión temporal. El proxy HTTPS que da acceso a **Home Assistant** puede seguir funcionando.

Este modo está pensado para uso privado. Las páginas de estado dejan de ser públicas y las llamadas externas a la API, métricas o monitores push no disponen de una URL pública independiente. Las integraciones que utilizaban el puerto 3001 deben revisarse antes de actualizar. Las comprobaciones salientes de los monitores siguen funcionando.

Ingress añade la autenticación de Home Assistant; se mantienen el acceso y OTP de Kuma. Esto no añade fail2ban ni bloqueo de IP a nivel de firewall. Para volver a la versión anterior y su forma de acceso, restaura la copia de seguridad.

## Desarrollo y validación

`adaptation/` adapta las rutas de Kuma al prefijo de Ingress y comprueba que la versión y los fragmentos originales coinciden antes de compilar el frontend. Un cambio de versión de Kuma requiere revisar esta adaptación.

La CI compila para amd64 y aarch64. `tests/` verifica rutas y recursos, WebSocket, aislamiento del puerto 3001, rechazo de clientes ajenos al Supervisor, navegación en navegador/iframe y actualización desde la imagen 2026.11.01 con una base SQLite de prueba. El Supervisor simulado de CI no sustituye una prueba de autenticación real de Home Assistant.
