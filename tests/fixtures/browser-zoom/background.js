// Solo se carga en el perfil desechable de Playwright. No lee páginas ni envía datos.
globalThis.chrome.runtime.onInstalled.addListener(() => {});
