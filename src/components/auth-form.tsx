"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { safeReturnTo } from "@/lib/utils";
import { Button } from "./ui/button";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const register = mode === "register";
  const forgot = mode === "forgot";
  const reset = mode === "reset";
  const returnTo = safeReturnTo(search.get("volver"));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    try {
      if (forgot) {
        const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/restablecer-contrasena` });
        if (result.error) throw new Error("No se pudo solicitar el enlace. Vuelve a intentarlo en un momento.");
        setSuccess(true); return;
      }
      if (reset) {
        const token = search.get("token");
        if (!token) throw new Error("El enlace no es válido. Solicita uno nuevo.");
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) throw new Error("El enlace expiró o no es válido. Solicita uno nuevo.");
        setSuccess(true); return;
      }
      const result = register ? await authClient.signUp.email({ email, password, name: String(data.get("name") || "").trim() }) : await authClient.signIn.email({ email, password });
      if (result.error?.status === 429) throw new Error("Has realizado varios intentos seguidos. Espera un momento antes de volver a intentarlo.");
      if (result.error) throw new Error(register ? "No pudimos crear la cuenta. Comprueba el correo y usa una contraseña de al menos 10 caracteres; si ya tienes cuenta, inicia sesión." : "El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.");
      // La bienvenida es una página, no el panel contextual de preferencias.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- La navegación de documento evita deliberadamente la ruta interceptada.
      if (register && returnTo === "/inicio") { window.location.assign("/configuracion?bienvenida=1"); return; }
      router.push(returnTo);
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "No se pudo conectar con Itera."); }
    finally { setBusy(false); }
  }

  return <div className="w-full min-w-0 max-w-[420px]">
    <p className="eyebrow">{register ? "Tu siguiente paso" : forgot || reset ? "Volvamos a conectar" : "Un intento más cerca"}</p>
    <h1 className="mt-4 text-[2rem] leading-tight font-semibold tracking-[-0.04em]">{register ? "Crear cuenta" : forgot ? "Recuperar cuenta" : reset ? "Cambiar contraseña" : "Iniciar sesión"}</h1>
    <p className="mt-4 text-base leading-7 text-muted-foreground">{register ? "Guarda tus borradores, intentos y progreso en esta computadora." : forgot ? "El enlace se guardará en la bandeja local de tu computadora." : reset ? "Elige una contraseña de al menos 10 caracteres." : "Continúa con tus ejercicios y borradores guardados."}</p>
    {success ? <div className="mt-8 rounded-xl bg-surface p-5" role="status"><p className="text-sm font-medium">{reset ? "Tu contraseña fue actualizada." : "Solicitud recibida."}</p><p className="mt-2 text-base leading-7 text-muted-foreground">{reset ? "Ya puedes iniciar sesión con tu nueva contraseña." : <>Si el correo está registrado, encontrarás el enlace en <code className="font-mono">.local/mail</code> dentro del proyecto.</>}</p><Link href="/iniciar-sesion" className="text-link mt-4">Volver a iniciar sesión <ArrowRight className="size-4" /></Link></div> : <form onSubmit={submit} className="mt-8 space-y-5" aria-describedby={error ? "auth-error" : undefined}>
      {register && <div><label htmlFor="name" className="field-label">Tu nombre</label><input id="name" name="name" autoComplete="name" className="field" placeholder="¿Cómo te llamas?" required minLength={2} maxLength={60} /></div>}
      {!reset && <div><label htmlFor="email" className="field-label">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" className="field" placeholder="tu@correo.com" required maxLength={254} /></div>}
      {!forgot && <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium">Contraseña</label>{!register && !reset && <Link href="/recuperar-cuenta" className="text-xs text-muted-foreground hover:text-primary">¿La olvidaste?</Link>}</div><div className="relative"><input id="password" name="password" type={visible ? "text" : "password"} autoComplete={register || reset ? "new-password" : "current-password"} className="field pr-12" placeholder={register || reset ? "Al menos 10 caracteres" : "Tu contraseña"} required minLength={register || reset ? 10 : 1} maxLength={128} /><button type="button" className="absolute top-0 right-0 flex size-11 items-center justify-center text-muted-foreground" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>}
      {error && <p id="auth-error" className="rounded-lg border border-destructive p-3 text-sm leading-6 text-destructive" role="alert">{error}</p>}
      <Button className="w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : null}{register ? "Crear mi cuenta" : forgot ? "Crear enlace de recuperación" : reset ? "Guardar contraseña" : "Iniciar sesión"}{!busy && <ArrowRight />}</Button>
      {!forgot && !reset && <p className="pt-2 text-center text-sm text-muted-foreground">{register ? "¿Ya tienes cuenta?" : "¿Es tu primera vez?"} <Link className="text-primary hover:underline" href={`${register ? "/iniciar-sesion" : "/registro"}?volver=${encodeURIComponent(returnTo)}`}>{register ? "Inicia sesión" : "Crea una cuenta"}</Link></p>}
    </form>}
    <Link href="/inicio" className="mt-9 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Volver a explorar</Link>
  </div>;
}
