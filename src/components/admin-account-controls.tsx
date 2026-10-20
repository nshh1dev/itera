"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { administerAccount } from "@/server/account-actions";
import type { AdminAccountInput } from "@/lib/admin-account-validation";

const labels = { activate: "Reactivar cuenta", deactivate: "Desactivar cuenta", promote: "Asignar ADMIN", demote: "Cambiar a USER" };

export function AdminAccountControls({ userId, email, role, disabled, self = false }: { userId: string; email: string; role: "USER" | "ADMIN"; disabled: boolean; self?: boolean }) {
  const router = useRouter();
  const [operation, setOperation] = useState<AdminAccountInput["operation"] | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const trigger = useRef<HTMLButtonElement | null>(null);
  function open(value: NonNullable<typeof operation>, button: HTMLButtonElement) {
    trigger.current = button;
    setError(""); setMessage(""); setOperation(value);
  }
  return <div className="flex flex-col items-start gap-3">
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={event => open(disabled ? "activate" : "deactivate", event.currentTarget)}>{labels[disabled ? "activate" : "deactivate"]}</Button>
      <Button variant="outline" onClick={event => open(role === "ADMIN" ? "demote" : "promote", event.currentTarget)}>{labels[role === "ADMIN" ? "demote" : "promote"]}</Button>
    </div>
    {message && <p role="status" className="text-sm">{message}</p>}
    <Dialog open={operation !== null} onOpenChange={value => { if (!value && !pending) setOperation(null); }}>
      <DialogContent onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}>
        <DialogTitle className="section-title">{operation ? labels[operation] : "Gestionar cuenta"}</DialogTitle>
        <DialogDescription className="mt-3 wrap-anywhere text-sm leading-6 text-muted-foreground">{email}. {operation === "deactivate" ? "Se cerrarán todas sus sesiones. Sus borradores, intentos y progreso se conservarán." : operation === "activate" ? "Podrá iniciar sesión de nuevo con todo su progreso. Las sesiones anteriores no se restauran." : "Cambiarán sus permisos y se cerrarán todas sus sesiones. ADMIN permite gestionar cuentas y contenido editorial."} {self && "Estás modificando tu propia cuenta; tendrás que iniciar sesión de nuevo."}</DialogDescription>
        <form className="mt-5 flex flex-col gap-4" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          if (!operation) return;
          startTransition(async () => {
            setError("");
            try {
              const result = await administerAccount({ userId, operation, expectedRole: role, expectedDisabled: disabled, password: data.get("password"), confirmed: data.get("confirmed") === "on" });
              if (result.error) { setError(result.error); return; }
              setOperation(null); setMessage("Cuenta actualizada. Las sesiones anteriores se han cerrado.");
              if (self) router.push("/iniciar-sesion");
              else router.refresh();
            } catch { setError("No se pudo actualizar la cuenta. Recarga la página y vuelve a intentarlo."); }
          });
        }}>
          <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4">
            <label className="field-label">Tu contraseña actual<input className="field mt-2" name="password" type="password" autoComplete="current-password" required maxLength={128} /></label>
            <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" name="confirmed" required className="mt-1" />Confirmo esta acción sobre la cuenta indicada.</label>
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={pending} onClick={() => setOperation(null)}>Cancelar</Button><Button type="submit" variant={operation === "deactivate" || operation === "demote" ? "destructive" : "default"} loading={pending}>{operation ? labels[operation] : "Confirmar"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
