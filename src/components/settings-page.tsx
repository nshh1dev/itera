"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { UserRound, GraduationCap, Palette, ShieldCheck, Hand, Sun, Moon, Monitor } from "lucide-react";
import { saveAccountName } from "@/server/learning-actions";
import { useRouter } from "next/navigation";
import { languageNames, levelNames } from "@/lib/types";
import { Button } from "./ui/button";
import { AccountSecurity } from "./account-security";
import { LearningPreferences, DiagnosticStart, type LearningProfiles } from "./learning-preferences";
import { StartingPoint, type LearningSummary } from "./starting-point";

const sections = [
  { id: "cuenta", label: "Mi cuenta", icon: UserRound },
  { id: "aprendizaje", label: "Aprendizaje", icon: GraduationCap },
  { id: "apariencia", label: "Apariencia", icon: Palette },
  { id: "seguridad", label: "Seguridad", icon: ShieldCheck },
  { id: "privacidad", label: "Privacidad y cuenta", icon: Hand },
];
const subscribe = () => () => {};
type DiagnosticHistory = { id: string; language: string; suggestedLevel: keyof typeof levelNames | null; reason: string | null; date: string }[];

export function SettingsPageContent({ section, user, profiles, summary, history }: { section: string; user: { id: string; name: string; email: string }; profiles: LearningProfiles; summary: LearningSummary; history: DiagnosticHistory }) {
  const active = sections.find(item => item.id === section) ?? sections[0];
  return <div className="preferences-page">
    <nav className="preferences-navigation" aria-label="Secciones de configuración">{sections.map(({ id, label, icon: Icon }) => <Link key={id} href={`/configuracion?seccion=${id}`} scroll={false} className="preferences-link" aria-current={active.id === id ? "page" : undefined}><Icon aria-hidden="true" className="size-4 shrink-0" /><span>{label}</span></Link>)}</nav>
    <div className="preferences-detail">
      <section hidden={active.id !== "cuenta"} aria-labelledby="account-title"><h2 id="account-title" className="section-title">Mi cuenta</h2><p className="preferences-description">Tus datos personales en esta instalación de Itera.</p><NameForm name={user.name} /><div className="preferences-group"><h3 className="text-sm font-medium">Correo electrónico</h3><p className="mt-2 break-all text-sm text-muted-foreground">{user.email}</p><AccountSecurity email={user.email} /></div></section>
      <section hidden={active.id !== "aprendizaje"} aria-labelledby="learning-title"><h2 id="learning-title" className="section-title">Aprendizaje</h2><p className="preferences-description">Tu punto de partida puede cambiar. Lo que ya has completado se conserva.</p><LearningPreferences language={summary.language} profiles={profiles} /><div className="preferences-group"><StartingPoint summary={summary} saved /><div className="mt-5"><DiagnosticStart language={summary.language} /></div><p className="mt-3 text-sm leading-6 text-muted-foreground">Guarda tus preferencias antes de empezar. El diagnóstico usa el lenguaje guardado: {languageNames[summary.language]}.</p></div>
        {!!history.length && <div className="preferences-group"><h3 className="text-sm font-medium">Diagnósticos anteriores</h3><ul className="mt-4 space-y-5">{history.map(entry => <li key={entry.id} className="text-sm"><p className="font-medium">{languageNames[entry.language as keyof typeof languageNames]} · {entry.suggestedLevel ? levelNames[entry.suggestedLevel] : "Sin resultado concluyente"}</p><time className="mt-1 block text-xs text-muted-foreground" dateTime={entry.date}>{new Date(entry.date).toLocaleDateString("es-ES", { timeZone: "UTC" })}</time><p className="mt-2 leading-6 text-muted-foreground">{entry.reason}</p></li>)}</ul></div>}
      </section>
      <section hidden={active.id !== "apariencia"} aria-labelledby="appearance-title"><h2 id="appearance-title" className="section-title">Apariencia</h2><p className="preferences-description">Elige cómo se ve Itera en este navegador.</p><Appearance /><div className="preferences-group"><h3 className="text-sm font-medium">Tu espacio de práctica</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">El tamaño del código, el ancho del enunciado, la altura de resultados y el editor sencillo se ajustan dentro de cada ejercicio. Conservamos tus preferencias actuales en este navegador.</p></div></section>
      <section hidden={active.id !== "seguridad"} aria-labelledby="security-title"><h2 id="security-title" className="section-title">Seguridad</h2><p className="preferences-description">Gestiona el acceso a tu cuenta.</p><p className="text-sm leading-6 text-muted-foreground">Cambiar la contraseña cierra las otras sesiones. Cerrar sesión en este navegador no elimina tus borradores ni tu progreso.</p><AccountSecurity email={user.email} section="security" /><div className="preferences-group"><h3 className="text-sm font-medium">Recuperación de acceso</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Los enlaces de recuperación se guardan en la carpeta <code className="break-all font-mono">.local/mail/</code> del proyecto. No se envían por correo electrónico.</p></div></section>
      <section hidden={active.id !== "privacidad"} aria-labelledby="privacy-title"><h2 id="privacy-title" className="section-title">Privacidad y cuenta</h2><p className="preferences-description">Tus datos permanecen en esta instalación. No hay copia en la nube.</p><dl className="space-y-5 text-sm leading-6"><div><dt className="font-medium">En la base de datos local</dt><dd className="mt-1 text-muted-foreground">Tu cuenta, preferencias de aprendizaje, diagnósticos, borradores, intentos y progreso se guardan en PostgreSQL.</dd></div><div><dt className="font-medium">En este navegador</dt><dd className="mt-1 text-muted-foreground">La apariencia, las preferencias del editor y las copias locales de código. Sin cuenta, tu código solo se conserva aquí.</dd></div></dl><div className="preferences-group"><h3 className="text-sm font-medium">Desactivar mi cuenta</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Se cerrarán todas tus sesiones. Tus datos se conservarán y un administrador podrá reactivar la cuenta. Esta acción requiere tu contraseña y una confirmación.</p><AccountSecurity email={user.email} section="privacy" /></div></section>
    </div>
  </div>;
}

function NameForm({ name }: { name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    const value = new FormData(event.currentTarget).get("name");
    try { const result = await saveAccountName(value); if (result.error) setError(result.error); else { setMessage("Tu nombre está actualizado."); router.refresh(); } }
    catch { setError("No se pudo guardar tu nombre. Vuelve a intentarlo."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-4"><div><label htmlFor="account-name" className="field-label">Nombre</label><input id="account-name" name="name" className="field" defaultValue={name} required minLength={2} maxLength={60} autoComplete="name" /></div><Button loading={busy}>Guardar nombre</Button>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</form>;
}

function Appearance() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return <><div className="segmented-control flex-wrap" role="group" aria-label="Apariencia">{[{ value: "light", label: "Claro", icon: Sun }, { value: "dark", label: "Oscuro", icon: Moon }, { value: "system", label: "Sistema", icon: Monitor }].map(({ value, label, icon: Icon }) => <Button key={value} variant="segment" aria-pressed={mounted && theme === value} onClick={() => setTheme(value)}><Icon aria-hidden="true" />{label}</Button>)}</div><p className="mt-4 text-sm leading-6 text-muted-foreground">Se aplica inmediatamente y se guarda en este navegador. Sistema sigue la apariencia de tu dispositivo.</p></>;
}
