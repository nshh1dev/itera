export const motion = {
  response: 120,
  disclosure: 200,
  navigation: 200,
  panelOpen: 320,
  panelClose: 220,
  ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type MotionOrigin = { element: HTMLElement; x: number; y: number; width: number; height: number };

export function originFrom(element: HTMLElement): MotionOrigin {
  const rect = element.getBoundingClientRect();
  return { element, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
}

// Solo se escribe desde eventos del navegador. No contiene datos de cuenta ni código.
let settingsOrigin: MotionOrigin | undefined;
export function rememberSettingsOrigin(element: HTMLElement) { settingsOrigin = originFrom(element); }
export function getSettingsOrigin() { return settingsOrigin; }

export function announceThemeChange() { window.dispatchEvent(new Event("itera:theme-changing")); }
