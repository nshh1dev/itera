"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const today = () => new Date().toDateString();
const serverToday = () => null;

export function ActivityDate({ date }: { date: string }) {
  const currentDay = useSyncExternalStore(subscribe, today, serverToday);
  const activity = new Date(date);
  if (Number.isNaN(activity.getTime())) return null;

  // La fecha relativa usa el calendario del navegador, también cerca de medianoche.
  const day = (value: Date) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  const elapsed = currentDay ? Math.round((day(new Date(currentDay)) - day(activity)) / 86_400_000) : null;
  const label = elapsed === 0 ? "Hoy" : elapsed === 1 ? "Ayer"
    : elapsed !== null && elapsed > 1 ? `Hace ${elapsed} días`
    : activity.toLocaleDateString("es-ES", { timeZone: "UTC", day: "numeric", month: "short" });

  return <time className="dashboard-activity-date" dateTime={date}>{label}</time>;
}
