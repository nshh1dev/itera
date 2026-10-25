"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { safeReturnTo } from "@/lib/utils";
import { newPasswordIssue, passwordPolicyMessage } from "@/lib/password-policy";
import { Button } from "./ui/button";
import { OnboardingProgress } from "./onboarding-progress";

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
  const loginHref = `/iniciar-sesion?volver=${encodeURIComponent(returnTo)}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    try {
      if (register || reset) {
        const issue = newPasswordIssue(password);
        if (issue) throw new Error(issue);
      }
      if (forgot) {
        const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/restablecer-contrasena?volver=${encodeURIComponent(returnTo)}` });
        if (result.error) throw new Error("No se pudo solicitar el enlace. Vuelve a intentarlo en un momento.");
        setSuccess(true); return;
      }
      if (reset) {
        const token = search.get("token");
        if (!token) throw new Error("El enlace no es válido. Solicita uno nuevo.");
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error?.code === "WEAK_PASSWORD") throw new Error(passwordPolicyMessage);
        if (result.error) throw new Error("El enlace expiró o no es válido. Solicita uno nuevo.");
        setSuccess(true); return;
      }
      const result = register ? await authClient.signUp.email({ email, password, name: String(data.get("name") || "").trim() }) : await authClient.signIn.email({ email, password });
      if (result.error?.code === "WEAK_PASSWORD") throw new Error(passwordPolicyMessage);
      if (result.error?.status === 429) throw new Error("Has realizado varios intentos seguidos. Espera un momento antes de volver a intentarlo.");
      if (result.error?.code === "ACCOUNT_DISABLED") throw new Error("Esta cuenta está desactivada. Contacta con un administrador para reactivarla.");
      if (result.error) throw new Error(register ? "No pudimos crear la cuenta. Comprueba el correo y usa una contraseña de al menos 10 caracteres; si ya tienes cuenta, inicia sesión." : "El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.");
      if (register) { router.push(`/bienvenida?volver=${encodeURIComponent(returnTo)}`); router.refresh(); return; }
      router.push(returnTo);
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "No se pudo conectar con Itera."); }
    finally { setBusy(false); }
  }

  return <div className="w-full min-w-0 max-w-[420px]">
    {register && <OnboardingProgress step={1} />}
    <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.04em]">{register ? "Crear cuenta" : forgot ? "Recuperar cuenta" : reset ? "Cambiar contraseña" : "Iniciar sesión"}</h1>
    {(register || forgot || reset) && <p className="mt-4 text-sm leading-6 text-muted-foreground">{register ? "Retoma tus borradores e intentos al entrar en esta instalación de Itera." : forgot ? "El enlace se guarda en la carpeta .local/mail del proyecto. No se envía por correo." : "Usa al menos 10 caracteres."}</p>}
    {success ? <div className="mt-8 rounded-xl bg-surface p-5" role="status"><p className="text-sm font-medium">{reset ? "Tu contraseña fue actualizada." : "Solicitud recibida."}</p><p className="mt-2 text-base leading-7 text-muted-foreground">{reset ? "Ya puedes iniciar sesión con tu nueva contraseña." : <>Si el correo está registrado, abre el archivo más reciente de <code className="break-all font-mono">.local/mail</code> y sigue su enlace.</>}</p><Link href={loginHref} className="text-link mt-4">Volver a iniciar sesión <ArrowRight className="size-4" /></Link></div> : <form onSubmit={submit} className="mt-8 space-y-5" aria-describedby={error ? "auth-error" : undefined}>
      {register && <div><label htmlFor="name" className="field-label">Tu nombre</label><input id="name" name="name" autoComplete="name" className="field" placeholder="¿Cómo te llamas?" required minLength={2} maxLength={60} /></div>}
      {!reset && <div><label htmlFor="email" className="field-label">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" className="field" placeholder="tu@correo.com" required maxLength={254} /></div>}
      {!forgot && <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium">Contraseña</label>{!register && !reset && <Link href={`/recuperar-cuenta?volver=${encodeURIComponent(returnTo)}`} className="text-xs text-muted-foreground hover:text-primary-text">¿La olvidaste?</Link>}</div><div className="relative"><input id="password" name="password" type={visible ? "text" : "password"} autoComplete={register || reset ? "new-password" : "current-password"} className="field pr-12" placeholder={register || reset ? "Al menos 10 caracteres" : "Tu contraseña"} required minLength={register || reset ? 10 : 1} maxLength={128} /><button type="button" className="absolute top-0 right-0 flex size-11 items-center justify-center text-muted-foreground" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>}
      {error && <p id="auth-error" className="rounded-lg border border-destructive p-3 text-sm leading-6 text-destructive" role="alert">{error}</p>}
      <Button className="w-full" loading={busy}>{register ? "Crear cuenta" : forgot ? "Crear enlace" : reset ? "Guardar contraseña" : "Iniciar sesión"}<ArrowRight /></Button>
      {!forgot && !reset && <p className="pt-2 text-center text-sm text-muted-foreground">{register ? "¿Ya tienes cuenta?" : "¿Es tu primera vez?"} <Link className="text-primary-text hover:underline" href={`${register ? "/iniciar-sesion" : "/registro"}?volver=${encodeURIComponent(returnTo)}`}>{register ? "Inicia sesión" : "Crea una cuenta"}</Link></p>}
    </form>}
    {!success && <Link href={forgot || reset ? loginHref : returnTo} className="mt-9 inline-flex min-h-11 items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />{forgot || reset ? "Volver a iniciar sesión" : returnTo.startsWith("/ejercicios/") ? "Volver al ejercicio" : "Volver a explorar"}</Link>}
  </div>;
}
