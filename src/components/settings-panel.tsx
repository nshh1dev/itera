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
    <DialogContent className="settings-dialog" onExitComplete={() => router.back()} onCloseAutoFocus={event => {
      event.preventDefault();
      const target = origin?.element.isConnected && origin.element.getClientRects().length ? origin.element
        : Array.from(document.querySelectorAll<HTMLElement>('[aria-label="Mi cuenta"], [aria-label="Configuración"], [aria-label="Abrir navegación"]')).find(element => element.getClientRects().length);
      target?.focus({ preventScroll: true });
    }}>
      <DialogTitle className="page-title pr-10">Configuración</DialogTitle>
      <DialogDescription className="sr-only">Mi perfil, práctica, apariencia y cuenta y privacidad. Guarda los cambios de nombre y práctica; las demás acciones se confirman por separado.</DialogDescription>
      <SettingsForm user={user} welcome={false} preserveDraft />
    </DialogContent>
  </Dialog>;
}
