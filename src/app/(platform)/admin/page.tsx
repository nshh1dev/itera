import Link from "next/link";
import { Plus,ArrowUpRight,Shield } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { Button } from "@/components/ui/button";
import { levelNames } from "@/lib/types";

export const metadata={title:"Administración"};
export default async function AdminPage(){
  await requireAdmin();
  const exercises=await db.exercise.findMany({orderBy:{order:"asc"},include:{versions:{orderBy:{number:"desc"},take:1}}});
  return <div className="page-container"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow flex items-center gap-2"><Shield className="size-3.5"/>Administración local</p><h1 className="page-title mt-3">Contenido que enseña.</h1><p className="mt-3 text-sm text-muted-foreground">Crea, revisa y publica ejercicios con versiones independientes.</p></div><Button asChild><Link href="/admin/ejercicios/nuevo"><Plus/>Nuevo ejercicio</Link></Button></div><div className="mt-9">{exercises.map(e=>{const version=e.versions[0];return <Link key={e.id} href={`/admin/ejercicios/${e.slug}`} className="flex items-center gap-4 border-b py-5"><div className="flex-1"><h2 className="text-sm font-medium">{version?.title??e.slug}</h2><p className="mt-1 text-xs text-muted-foreground">{e.category} · {version?levelNames[version.level]:"Sin versión"}</p></div><span className="text-xs text-muted-foreground">v{version?.number??0} · {e.published?version?.published?"Publicado":"Nueva versión en borrador":"Oculto"}</span><ArrowUpRight className="size-4 text-muted-foreground"/></Link>;})}</div></div>;
}
