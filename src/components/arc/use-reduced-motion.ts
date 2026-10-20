"use client";
import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
let media: MediaQueryList | undefined;
const listeners = new Set<() => void>();
const getMedia = () => media ??= window.matchMedia(query);
const notify = () => listeners.forEach(listener => listener());
function subscribe(listener: () => void) {
  if (listeners.size === 0) getMedia().addEventListener("change", notify);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) getMedia().removeEventListener("change", notify);
  };
}
const snapshot = () => getMedia().matches;
const serverSnapshot = () => true;

// La versión instalada de Motion lee su hook una sola vez. Esta adaptación
// también responde al cambio de preferencia durante una apertura o ejecución.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
