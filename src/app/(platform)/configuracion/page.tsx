import { requireUser } from "@/server/auth";
import { SettingsForm } from "@/components/settings-form";
import type { Language } from "@/lib/types";
import Link from "next/link";
export const metadata = { title: "Configuración" };
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{bienvenida?: string}> }) {
  const user = await requireUser();
  const welcome = (await searchParams).bienvenida === "1";
  return <div className="page-container"><h1 className="page-title">{welcome ? `Bienvenido, ${user.name.split(" ")[0]}.` : "Configuración"}</h1><p className="mt-2 text-sm text-muted-foreground">{welcome ? "Elige un punto de partida. Todo se puede cambiar después." : "Tu perfil y tus preferencias de práctica."}</p><SettingsForm welcome={welcome} user={{id:user.id,name:user.name,email:user.email,language:(user.preference?.language ?? "python") as Language,level:user.preference?.level ?? "INITIATION"}} />{welcome && <Link href="/inicio" className="text-link mt-9">Ir a mi espacio →</Link>}</div>;
}
