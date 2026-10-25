"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { passwordChangeSchema } from "@/lib/account-validation";
import { passwordPolicyMessage } from "@/lib/password-policy";
import { changeAccountEmail, deactivateAccount } from "@/server/account-actions";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

type Mode = "email" | "password" | "deactivate";
const titles: Record<Mode, string> = { email: "Cambiar correo", password: "Cambiar contraseña", deactivate: "Desactivar cuenta" };

export function AccountSecurity({ email, section = "account" }: { email: string; section?: "account" | "security" | "privacy" }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const id = useId();
  const origin = useRef<HTMLElement | null>(null);

  function open(next: Mode, trigger: HTMLElement) { origin.current = trigger; setError(""); setMessage(""); setMode(next); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); event.stopPropagation();
    if (busy || !mode) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError("");
    try {
      if (mode === "password") {
        const parsed = passwordChangeSchema.safeParse(Object.fromEntries(data));
        if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revisa la nueva contraseña."); return; }
        const result = await authClient.changePassword({ currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: true });
        if (result.error?.code === "WEAK_PASSWORD") { setError(passwordPolicyMessage); return; }
        if (result.error) { setError("No se pudo cambiar la contraseña. Comprueba la contraseña actual y que la nueva tenga entre 10 y 128 caracteres, o vuelve a iniciar sesión."); return; }
        setMessage("Contraseña actualizada. Las otras sesiones se han cerrado.");
      } else if (mode === "email") {
        const result = await changeAccountEmail(Object.fromEntries(data));
        if (result.error) { setError(result.error); return; }
        setMessage("Correo actualizado. Usa el nuevo correo para iniciar sesión. Las otras sesiones se han cerrado.");
        router.refresh();
      } else {
        const result = await deactivateAccount({ password: data.get("password"), confirmed: data.get("confirmed") === "on" });
        if (result.error) { setError(result.error); return; }
        // La base de datos ya invalidó todas las sesiones, incluso si falla la limpieza de la cookie.
        try { await authClient.signOut(); } catch { /* La sesión ya no es válida. */ }
        window.location.replace("/");
        return;
      }
      form.reset(); setMode(null);
    } catch { setError("No se pudo completar la acción. Comprueba tu conexión y vuelve a intentarlo."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true); setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error();
      window.location.replace("/");
    } catch { setError("No se pudo cerrar la sesión. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  }

  return <div className="mt-4">
    <div className="flex flex-wrap gap-2">
      {section === "privacy" ? <Button type="button" variant="ghost" className="text-destructive" onClick={event => open("deactivate", event.currentTarget)}>Desactivar cuenta</Button> : section === "security" ? <><Button type="button" variant="outline" onClick={event => open("password", event.currentTarget)}>Cambiar contraseña</Button><Button type="button" variant="outline" loading={busy} onClick={signOut}>Cerrar sesión</Button></> : <Button type="button" variant="outline" onClick={event => open("email", event.currentTarget)}>Cambiar correo</Button>}
    </div>
    {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
    {!mode && error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <Dialog open={mode !== null} onOpenChange={value => { if (!value && !busy) { setMode(null); setError(""); } }}>
      {mode && <DialogContent onCloseAutoFocus={event => { event.preventDefault(); if (origin.current?.isConnected) origin.current.focus({ preventScroll: true }); }} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onPointerDownOutside={event => { if (busy) event.preventDefault(); }}>
        <DialogTitle className="section-title pr-8">{titles[mode]}</DialogTitle>
        <DialogDescription className="mt-3 wrap-anywhere text-sm leading-6 text-muted-foreground">{mode === "deactivate" ? "Se cerrarán todas tus sesiones y no podrás acceder hasta que un administrador reactive tu cuenta. Tu perfil, progreso, borradores e intentos se conservarán. No se eliminará ningún dato ni ejercicio." : mode === "email" ? `Correo actual: ${email}. Confirma tu contraseña para cambiarlo. No se enviarán enlaces ni se verificará la propiedad del nuevo correo. Se cerrarán las otras sesiones.` : "Introduce tu contraseña actual y elige una nueva de entre 10 y 128 caracteres. Se cerrarán las otras sesiones."}</DialogDescription>
        <form className="mt-5 flex flex-col gap-4" aria-describedby={error ? `${id}-error` : undefined} onSubmit={submit} onChange={event => { event.stopPropagation(); setError(""); }}>
          <fieldset disabled={busy} className="flex min-w-0 flex-col gap-4">
            {mode === "email" && <div><label className="field-label" htmlFor={`${id}-email`}>Nuevo correo electrónico</label><input id={`${id}-email`} className="field" type="email" name="email" autoComplete="email" maxLength={254} required /></div>}
            <div><label className="field-label" htmlFor={`${id}-current`}>Contraseña actual</label><input id={`${id}-current`} className="field" type="password" name={mode === "password" ? "currentPassword" : "password"} autoComplete="current-password" maxLength={128} required /></div>
            {mode === "password" && <><div><label className="field-label" htmlFor={`${id}-new`}>Nueva contraseña</label><input id={`${id}-new`} className="field" type="password" name="newPassword" autoComplete="new-password" minLength={10} maxLength={128} required /></div><div><label className="field-label" htmlFor={`${id}-confirmation`}>Confirmar nueva contraseña</label><input id={`${id}-confirmation`} className="field" type="password" name="confirmation" autoComplete="new-password" minLength={10} maxLength={128} required /></div></>}
            {mode === "deactivate" && <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" name="confirmed" required className="mt-1" />Entiendo que necesitaré un administrador para volver a acceder.</label>}
          </fieldset>
          {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => { setMode(null); setError(""); }}>Cancelar</Button><Button type="submit" variant={mode === "deactivate" ? "destructive" : "default"} loading={busy}>{titles[mode]}</Button></div>
        </form>
      </DialogContent>}
    </Dialog>
  </div>;
}
