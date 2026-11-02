# Uptime Kuma Ingress Preview

Variante experimental e independiente para uso privado dentro de Home Assistant.
**No sustituye al add-on actual y no reutiliza su carpeta de datos.**
Estado: adaptación preparada; requiere construcción del contenedor y prueba real
en Home Assistant antes de considerarse compatible.

## Diseño

- Home Assistant autentica la sesión Ingress.
- Nginx interno escucha en 8099 y solo acepta al Supervisor (172.30.32.2).
- Kuma escucha en 127.0.0.1:3001 dentro del contenedor.
- No se publica ningún puerto del host ni se incluye cloudflared.
- Se conservan el login, OTP y comprobación de origen WebSocket de Kuma.
- Panel administrativo; no es una integración SSO con usuarios de Kuma.
- Las rutas Vue, Socket.IO, Axios, recursos y redirecciones se adaptan al
  prefijo validado X-Ingress-Path. El frontend se compila desde el código 2.5.9.
- No se registra el service worker de Kuma bajo el origen de Home Assistant.
- Los cambios de versión o de los fragmentos de código esperados detienen
  la compilación para exigir revisión.

La variante está aislada deliberadamente: el Dockerfile, config.yaml y proceso
de publicación del add-on estable no cambian. Su carpeta no contiene image:
por lo que la instalación local construye la imagen y puede tardar.

## Probar sin migrar datos

1. Crear una copia de seguridad del add-on actual.
2. Copiar esta carpeta completa como /addons/uptime-kuma-cfm-ingress-preview
   en Home Assistant (carpeta de add-ons locales, no /config).
3. Recargar la tienda de add-ons e instalar "Uptime Kuma Ingress Preview".
4. Arrancarlo y pulsar "Abrir interfaz web". Activar "Mostrar en la barra lateral".
5. Crear una cuenta de prueba y activar OTP. Añadir solo un monitor de prueba.
   No copiar una base de datos mientras el Kuma original está ejecutándose.
6. Comprobar en navegador y aplicación móvil:
   - creación de cuenta, login, contraseña errónea y OTP correcto/incorrecto;
   - panel, ajustes, edición de un monitor y actualizaciones en tiempo real;
   - recarga de /dashboard y de una página de detalle;
   - reconexión tras reiniciar el add-on;
   - iconos, capturas de pantalla y páginas de estado privadas, si se utilizan;
   - entrada desde el panel oficial después de caducar la sesión;
   - rechazo al abrir la ruta Ingress sin sesión de Home Assistant.
7. Comprobar que no se puede acceder a 3001 ni 8099 desde la LAN.
   El servidor 8099 solo debe aceptar al Supervisor en su red interna.

## Límites y migración posterior

No desactivar todavía el dominio Nginx del Kuma original. Este preview tiene
datos nuevos y no es una actualización de producción. Una vez aprobadas las
pruebas, preparar por separado la migración con copia de seguridad y reversión.

No copiar una URL /api/hassio_ingress/... como dirección permanente de un iframe.
Primero probar el panel oficial. La tarjeta o iframe del dashboard necesita
resolver y mantener correctamente la sesión Ingress y se validará por separado.

Las URLs de push, badges, API, RSS y páginas de estado de esta variante requieren
la sesión de HA; no se consideran endpoints públicos ni aptos para clientes
automáticos externos. Tampoco anuncia discovery para otras integraciones de HA.
Web Push/PWA de Kuma no se ofrece bajo el origen de HA.
No activar túneles alternativos ni deshabilitar la autenticación de Kuma.

## Validación

Ejecutar: node --test ingress-preview/tests/adaptation.test.mjs desde la raíz
del repositorio. UPSTREAM_DIR puede apuntar a una copia limpia de Kuma 2.5.9
para comprobar también la aplicación y el rechazo de una segunda aplicación.

El workflow Ingress preview construye sin publicar, comprueba nginx -t y usa
una red Docker aislada para simular la IP del Supervisor. Comprueba HTML,
recursos, cabeceras inválidas, rechazo de otros clientes, puerto 3001 inaccesible
y handshake WebSocket. Esta simulación no sustituye la prueba en HA.

Referencias:
- https://contributors.home-assistant.io/apps/guides/ingress/
- https://github.com/louislam/uptime-kuma/tree/2.5.9
