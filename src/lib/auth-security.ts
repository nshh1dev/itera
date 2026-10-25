// Itera solo escucha en loopback: todos los clientes comparten el cupo local.
// No confiar en X-Forwarded-For ni en otras cabeceras aportadas por el cliente.
// Un despliegue público deberá definir su propia frontera de proxy confiable.
export const localAuthIpAddress = { ipAddressHeaders: [] as string[] };
