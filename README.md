# Uptime Kuma para Home Assistant

Uptime Kuma 2.5.11 con acceso mediante **Ingress** y un puerto directo configurable para integraciones.

## Monitorizar SIP por UDP

Crea un monitor **SIP Options Ping** con el nombre o IP del servidor y su puerto UDP (habitualmente **5060**). En **Usuario PJSIP (From)** indica un endpoint PJSIP que exista en FreePBX, por ejemplo una extensión dedicada de monitorización. No introduzcas una contraseña ni el usuario de la interfaz web. Antes de reactivar un monitor creado con una versión anterior, edítalo y completa este campo.

El add-on envía **un solo OPTIONS por comprobación** y escucha la respuesta en el mismo puerto UDP desde el que envía. No intenta autenticarse cuando recibe un desafío SIP 401. Cualquier respuesta final SIP válida (2xx–6xx, incluidos 401 o 403) indica que el servicio responde; una ausencia de respuesta o un error de red lo marca como caído. El usuario PJSIP debe existir y poder ser identificado por Asterisk: si aparecen `InvalidAccountID` o bloqueos de Fail2ban, pausa el monitor y revisa ese usuario antes de repetir la prueba. La IP pública de Home Assistant puede cambiar si FreePBX identifica el endpoint por usuario.

El monitor **Puerto** comprueba TCP y no sirve para verificar 5060/UDP. Una respuesta como `503 Service Unavailable` contará como «responde», aunque el servicio de llamadas no esté sano; este monitor no verifica registros, llamadas ni calidad de voz.

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
