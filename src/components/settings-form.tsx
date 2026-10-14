"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Sun, Moon, Loader2, Check } from "lucide-react";
import { savePreferences } from "@/server/actions";
import { levelNames, type Level, type Language } from "@/lib/types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function SettingsForm({ user, welcome }: { user: {name: string; email: string; language: Language; level: Level}; welcome: boolean }) {
  const { setTheme } = useTheme();
  const [appearance, setAppearance] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await savePreferences(Object.fromEntries(data));
      setError(!!result.error); setMessage(result.error ?? "Tus preferencias están guardadas.");
    } catch { setError(true); setMessage("No se pudieron guardar los cambios. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  }
  return <><form onSubmit={submit} className="mt-10 max-w-2xl"><section className="border-b pb-8"><h2 className="section-title">Tu perfil</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><label htmlFor="name" className="field-label">Nombre</label><input className="field" id="name" name="name" defaultValue={user.name} minLength={2} maxLength={60} required /></div><div><label htmlFor="email" className="field-label">Correo electrónico</label><input className="field text-muted-foreground" id="email" value={user.email} readOnly /></div></div></section><section className="border-b py-8"><h2 className="section-title">Tu punto de partida</h2><p className="mt-2 text-sm text-muted-foreground">Son preferencias, no límites. Puedes explorar todos los ejercicios.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><label htmlFor="language" className="field-label">Lenguaje preferido</label><select className="field" name="language" id="language" defaultValue={user.language}><option value="python">Python</option><option value="javascript">JavaScript</option></select></div><div><label htmlFor="level" className="field-label">Nivel</label><select className="field" name="level" id="level" defaultValue={user.level}>{Object.entries(levelNames).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div></div></section><div className="mt-6 flex flex-wrap items-center gap-4"><Button disabled={busy}>{busy && <Loader2 className="animate-spin" />}{welcome ? "Guardar y empezar" : "Guardar cambios"}</Button>{message && <p role="status" className={cn("flex items-center gap-2 text-sm", error ? "text-destructive" : "text-muted-foreground")}>{!error && <Check className="size-4 text-success" />}{message}</p>}</div></form>
    <section className="mt-12 max-w-2xl border-t pt-8"><h2 className="section-title">Un espacio a tu gusto</h2><p className="mt-2 text-sm text-muted-foreground">La apariencia se guarda en este navegador.</p><div className="mt-5 flex flex-wrap gap-3">{[{ value:"light", label:"Claro", icon:Sun },{ value:"dark", label:"Oscuro", icon:Moon },{ value:"system", label:"Sistema", icon:Monitor }].map(({value,label,icon:Icon}) => <Button variant={appearance === value ? "secondary" : "outline"} key={value} onClick={() => {setTheme(value); setAppearance(value);}}><Icon />{label}</Button>)}</div></section>
    <section className="mt-10 max-w-2xl border-t pt-8"><h2 className="section-title">Tus datos se quedan aquí</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Las cuentas, los borradores y el progreso se guardan en el PostgreSQL de tu computadora. No hay analítica externa, suscripciones ni conexiones con IA.</p><p className="mt-3 text-xs text-muted-foreground">Para recuperar tu contraseña, usa “¿La olvidaste?” al iniciar sesión. El enlace llegará a .local/mail.</p></section></>;
}
