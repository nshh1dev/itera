"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Sun, Moon, Loader2, Check } from "lucide-react";
import { savePreferences } from "@/server/actions";
import { languages, languageNames, levelNames, type Level, type Language } from "@/lib/types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { announceThemeChange } from "@/lib/motion";

const subscribe = () => () => {};
export function SettingsForm({ user, welcome, preserveDraft = false }: { user: { name: string; email: string; language: Language; level: Level }; welcome: boolean; preserveDraft?: boolean }) {
  const form = useRef<HTMLFormElement>(null);
  const draftKey = `itera:settings-draft:${user.email}`;
  useEffect(() => {
    if (!preserveDraft || !form.current) return;
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey) ?? "null");
      if (!draft || typeof draft !== "object") return;
      for (const key of ["name", "language", "level"]) {
        const field = form.current.elements.namedItem(key);
        if ((field instanceof HTMLInputElement || field instanceof HTMLSelectElement) && typeof draft[key] === "string") field.value = draft[key];
      }
    } catch { /* El almacenamiento no es necesario para guardar en la cuenta. */ }
  }, [draftKey, preserveDraft]);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const appearance = mounted ? theme : undefined;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [dirty, setDirty] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await savePreferences(Object.fromEntries(data));
      setError(!!result.error); setMessage(result.error ?? "Tus preferencias están guardadas.");
      if (!result.error) { setDirty(false); try { sessionStorage.removeItem(draftKey); } catch {} }
    } catch { setError(true); setMessage("No se pudieron guardar los cambios. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  }
  return <div className="settings-layout">
    <form ref={form} onSubmit={submit} onChange={event => {
      setDirty(true); setMessage("");
      if (!preserveDraft) return;
      try { sessionStorage.setItem(draftKey, JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))); } catch {}
    }} className="mt-7 flex max-w-3xl flex-col gap-5">
      <section className="settings-section"><h2 className="section-title">Tu perfil</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="name" className="field-label">Nombre</label><input className="field" id="name" name="name" defaultValue={user.name} minLength={2} maxLength={60} required /></div>
        <div><label htmlFor="email" className="field-label">Correo electrónico</label><input className="field text-muted-foreground" id="email" value={user.email} readOnly /></div>
      </div></section>
      <section className="settings-section"><h2 className="section-title">Tu punto de partida</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Son preferencias, no límites. Puedes explorar todos los ejercicios.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="language" className="field-label">Lenguaje preferido</label><select className="field" name="language" id="language" defaultValue={user.language}>{languages.map(language => <option key={language} value={language}>{languageNames[language]}</option>)}</select></div>
        <div><label htmlFor="level" className="field-label">Nivel</label><select className="field" name="level" id="level" defaultValue={user.level}>{Object.entries(levelNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      </div></section>
      <div className="flex flex-wrap items-center gap-4"><Button disabled={busy}>{busy && <Loader2 className="animate-spin" />}{welcome ? "Guardar y empezar" : "Guardar cambios"}</Button>{dirty && !message && <p className="text-xs text-muted-foreground">Cambios sin guardar</p>}{message && <p role="status" className={cn("flex items-center gap-2 text-sm", error ? "text-destructive" : "text-muted-foreground")}>{!error && <Check className="size-4 shrink-0 text-success-text" />}{message}</p>}</div>
    </form>
    <div className="settings-local"><section className="settings-section mt-8 max-w-3xl"><h2 className="section-title">Apariencia</h2><p className="mt-2 text-sm text-muted-foreground">Se aplica al instante y se guarda en este navegador. Sistema sigue la apariencia de tu computadora.</p><div className="segmented-control mt-4" role="group" aria-label="Apariencia">{[{ value: "light", label: "Claro", icon: Sun }, { value: "dark", label: "Oscuro", icon: Moon }, { value: "system", label: "Sistema", icon: Monitor }].map(({ value, label, icon: Icon }) => <Button variant="segment" aria-pressed={appearance === value} key={value} onClick={() => { announceThemeChange(); setTheme(value); }}><Icon aria-hidden="true" />{label}</Button>)}</div></section>
    <section className="mt-8 max-w-3xl"><h2 className="section-title">Tus datos se quedan aquí</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Las cuentas, los borradores y el progreso se guardan en la base de datos de tu computadora. No hay analítica externa, suscripciones ni conexiones con IA.</p><p className="mt-3 text-xs leading-6 text-muted-foreground">Para recuperar tu contraseña, usa “¿La olvidaste?” al iniciar sesión. El enlace se guardará en la carpeta <code className="break-words font-mono">.local/mail</code> del proyecto; no se enviará por correo.</p></section>
    </div>
  </div>;
}
