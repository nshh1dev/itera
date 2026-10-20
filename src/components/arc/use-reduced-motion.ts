"use client";
import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
function subscribe(listener: () => void) {
  const preference = window.matchMedia(query);
  preference.addEventListener("change", listener);
  return () => preference.removeEventListener("change", listener);
}
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => true;

// La versión instalada de Motion lee su hook una sola vez. Esta adaptación
// también responde al cambio de preferencia durante una apertura o ejecución.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
