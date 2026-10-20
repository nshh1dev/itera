// Solo se escribe desde eventos del navegador. No contiene datos de cuenta ni código.
// Se conserva el activador para restaurar foco, no para calcular animaciones.
let settingsOrigin: { element: HTMLElement } | undefined;
export function rememberSettingsOrigin(element: HTMLElement) { settingsOrigin = { element }; }
export function getSettingsOrigin() { return settingsOrigin; }
