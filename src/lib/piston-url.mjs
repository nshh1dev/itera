/** @param {string} value @param {boolean} [container] */
export function pistonOrigin(value, container = false) {
  const url = new URL(value);
  const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  const internal = container && url.origin === "http://piston:2000";
  if (url.protocol !== "http:" || url.username || url.password || (!loopback && !internal)) {
    throw new Error("Piston debe ser HTTP local o el servicio interno autorizado de Docker.");
  }
  return url.origin;
}
