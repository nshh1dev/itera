import { requireUser } from "@/server/auth";
import { SettingsForm } from "@/components/settings-form";
import type { Language } from "@/lib/types";
import Link from "next/link";
export const metadata = { title: "Configuración" };
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{bienvenida?: string}> }) {
  const user = await requireUser();
  const welcome = (await searchParams).bienvenida === "1";
  return <div className="page-container"><p className="eyebrow">{welcome ? "Ya tienes tu lugar" : "A tu manera"}</p><h1 className="page-title mt-3">{welcome ? `Bienvenido, ${user.name.split(" ")[0]}.` : "Tu espacio, tus preferencias."}</h1><p className="mt-3 text-sm text-muted-foreground">{welcome ? "Elige un punto de partida. Todo se puede cambiar después." : "Haz que Itera se adapte a cómo te gusta aprender."}</p><SettingsForm welcome={welcome} user={{name:user.name,email:user.email,language:(user.preference?.language ?? "python") as Language,level:user.preference?.level ?? "BEGINNER"}} />{welcome && <Link href="/inicio" className="text-link mt-9">Ir a mi espacio →</Link>}</div>;
}
