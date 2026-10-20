"use client";
import { useActionState } from "react";
import { Button } from "./ui/button";
import { reactivateAccount } from "@/server/account-actions";

export function ReactivateAccountButton({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<{ error?: string; success?: boolean }, FormData>(async (_previous, data) => {
    try { return await reactivateAccount(data); }
    catch { return { error: "No se pudo reactivar la cuenta. Recarga la página e inténtalo de nuevo." }; }
  }, {});
  return <form action={action}><input type="hidden" name="userId" value={userId} /><Button variant="outline" loading={pending}>Reactivar cuenta</Button>{state.error && <p role="alert" className="mt-2 text-sm text-destructive">{state.error}</p>}</form>;
}
