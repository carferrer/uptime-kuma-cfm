# uptime-kuma-cfm
Herramienta de monitorización
Utiliza el puerto 3001 por lo que para acceder a la aplicacion http:://ip_ha:3001
Para poder integrarlo en iframe en HA:
  1º.- Utilizar proxy para poder convertir kuma a SSL.
  2º.- Crear iframe que el enlace sea al dominio y puerto bajo ssl del proxy apuntando a http:://ip_ha:3001
