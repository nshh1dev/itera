import Link from "next/link";
import { Plus,ArrowRight } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { levelNames } from "@/lib/types";
import { getAdminStatistics } from "@/server/admin-statistics";

export const metadata={title:"Administración"};
export default async function AdminPage(){
  await requireAdmin();
   const [exercises, stats] = await Promise.all([db.exercise.findMany({orderBy:{order:"asc"},include:{versions:{orderBy:{number:"desc"},take:1}}}), getAdminStatistics()]);
  return <div className="page-container">
    <div className="page-intro">
       <div><h1 className="page-title">Administración</h1></div>
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/admin/cuentas">Gestionar usuarios</Link></Button><Button asChild><Link href="/admin/ejercicios/nuevo"><Plus aria-hidden="true" />Nuevo ejercicio</Link></Button></div>
    </div>
    <section aria-labelledby="usage-title" className="mb-10 rounded-xl bg-surface p-5 sm:p-6">
      <h2 id="usage-title" className="section-title">Uso de Itera</h2>
      <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">{[
        ["Usuarios registrados", stats.users], ["Cuentas activas", stats.enabled], ["Cuentas desactivadas", stats.disabled],
        ["Usuarios con actividad en 7 días", stats.recentlyActive], ["Ejercicios publicados", stats.published], ["Ejercicios editoriales, incluidos históricos", stats.exercises],
        ["Ejecuciones registradas", stats.submissions], ["Comprobaciones correctas", stats.completed], ["Comprobaciones incorrectas", stats.failed],
        ["Ejecuciones de ejemplos", stats.examples], ["Borradores guardados", stats.drafts], ["Completaciones por ejercicio y lenguaje", stats.completions],
      ].map(([label, value]) => <div key={label} className="flex items-baseline justify-between gap-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-mono text-sm tabular-nums">{value}</dd></div>)}</dl>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">Activa significa habilitada, no conectada. La actividad incluye visitas a ejercicios, borradores e intentos. Los totales incluyen cuentas de prueba, cuentas desactivadas y catálogo histórico; un ejercicio resuelto en dos lenguajes suma dos completaciones.</p>
    </section>
    <section aria-labelledby="recent-admin-title" className="mb-10"><h2 id="recent-admin-title" className="section-title">Últimas ejecuciones</h2>
      {stats.recent.length ? <ul className="mt-3 flex flex-col gap-1">{stats.recent.map(item => <li key={item.id} className="list-entry flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><Link className="text-link text-sm" href={`/admin/cuentas/${item.user.id}`}>{item.user.name}</Link><p className="mt-1 wrap-anywhere text-sm text-muted-foreground">{item.variant.version.title} · {item.variant.language} · {item.mode === "submit" ? "Comprobación" : "Ejemplos"}</p></div><div className="text-sm text-muted-foreground"><p>{item.status === "PASSED" ? "Pruebas superadas" : item.status === "FAILED" ? "Pruebas no superadas" : item.status === "RUNNING" ? "En evaluación" : "Error de ejecución"}</p><time dateTime={item.createdAt.toISOString()}>{new Intl.DateTimeFormat("es", { dateStyle: "short", timeStyle: "short" }).format(item.createdAt)}</time></div></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">Todavía no hay ejecuciones registradas.</p>}
    </section>
    <h2 className="section-title mb-4">Contenido editorial</h2>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><p>{exercises.length} ejercicios editoriales</p><p>Los borradores no son visibles para estudiantes.</p></div>
    {exercises.length ? <ul className="space-y-1">{exercises.map(e=>{
      const version=e.versions[0];
      return <li key={e.id}><Link href={`/admin/ejercicios/${e.slug}`} className="list-entry flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1 basis-48"><h2 className="break-words text-base font-medium">{version?.title??e.slug}</h2><p className="mt-1 text-xs text-muted-foreground">{e.category} · {version?levelNames[version.level]:"Sin versión"}</p></div>
        <div className="flex flex-wrap items-center gap-3"><span className="text-xs text-muted-foreground">Versión {version?.number??0}</span><Badge variant="outline">{e.published?"Visible en el catálogo":"Oculto del catálogo"}</Badge><Badge variant="outline">{version?.published?"Versión publicada":"Versión guardada en borrador"}</Badge></div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link></li>;
    })}</ul> : <div className="empty-state"><h2 className="section-title">Prepara el primer ejercicio</h2><p className="text-sm text-muted-foreground">Añade un enunciado, las variantes y sus pruebas. Después podrás validarlo y publicarlo.</p><Button asChild><Link href="/admin/ejercicios/nuevo">Crear ejercicio</Link></Button></div>}
  </div>;
}
