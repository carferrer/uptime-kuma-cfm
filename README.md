# Uptime Kuma para Home Assistant

Uptime Kuma 2.5.9 con acceso mediante **Ingress** y un puerto directo configurable para integraciones.

## Configurar el puerto de la integración

Desde **2026.11.03**, abre el add-on → **Configuración → Red**. El puerto interno **3001/tcp** se publica en **3001** por defecto. Puedes cambiar el puerto del host, por ejemplo a **13001**, guardar y reiniciar el add-on.

En la integración utiliza `http://IP_DE_HOME_ASSISTANT:3001`, o el puerto del host que hayas elegido. Se mantienen las credenciales y OTP de Kuma; la compatibilidad con OTP depende del cliente de la integración. No uses la URL temporal de Ingress para conectarla.

Puedes desactivar la publicación dejando vacío el puerto en Red. Esto elimina el puerto del host; no impide el acceso desde la red interna de contenedores del Supervisor.

Este acceso directo usa HTTP y la autenticación de Kuma, no la autenticación previa de HA. No es necesario abrir ni redirigir el puerto en el router para la integración local.

## Ingress

**Abrir interfaz web** y el panel lateral siguen utilizando Ingress en el puerto interno 8099, restringido al Supervisor. El proxy adapta las rutas de Ingress y las del acceso directo de forma independiente.

Kuma escucha en 127.0.0.1:3002 dentro del contenedor; nginx ofrece las entradas 3001 (directa) y 8099 (Ingress). El puerto 3002 no se publica.

## Actualización

Actualiza el add-on existente sin desinstalarlo. Se conservan el identificador `uptime-kuma-cfm`, el directorio `/data`, usuarios, monitores, historial, notificaciones y OTP. Haz una copia de seguridad antes de actualizar.

La versión local **Uptime Kuma Ingress Preview** tiene datos independientes. La versión 2026.11.02 solo permitía Ingress; 2026.11.03 recupera el acceso directo para integraciones. No se restaura Cloudflare Tunnel.

## Desarrollo y validación

`adaptation/` adapta rutas y WebSocket al prefijo de Ingress. Cambiar la versión de Kuma requiere revisar esa adaptación.

La CI compila amd64/aarch64 y comprueba Ingress, HTML y WebSocket directos, el mapeo de 3001 a otro puerto del host, rechazo de clientes ajenos al Supervisor en 8099 y aislamiento del backend 3002. Verifica conservación de datos y login con OTP por ambos accesos tras actualizar la base SQLite de prueba.
