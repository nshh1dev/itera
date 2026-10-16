"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { SettingsForm } from "./settings-form";
import { getSettingsOrigin } from "@/lib/motion";

export function SettingsPanel({ user }: { user: React.ComponentProps<typeof SettingsForm>["user"] }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [origin] = useState(getSettingsOrigin);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="settings-dialog" origin={origin} onExitComplete={() => router.back()} onCloseAutoFocus={event => {
      event.preventDefault();
      const target = origin?.element.isConnected && origin.element.getClientRects().length ? origin.element
        : Array.from(document.querySelectorAll<HTMLElement>('[aria-label="Mi cuenta"], [aria-label="Configuración"], [aria-label="Abrir navegación"]')).find(element => element.getClientRects().length);
      target?.focus({ preventScroll: true });
    }}>
      <DialogTitle className="page-title pr-10">Configuración</DialogTitle>
      <DialogDescription className="mt-3 text-sm text-muted-foreground">Tu perfil y tus preferencias de práctica. Los cambios del formulario se guardan solo al confirmarlos.</DialogDescription>
      <SettingsForm user={user} welcome={false} preserveDraft />
    </DialogContent>
  </Dialog>;
}
