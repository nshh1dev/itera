import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { getCatalog } from "@/server/catalog";
import { languages, languageNames } from "@/lib/types";
import { AdminAccountControls } from "@/components/admin-account-controls";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/arc/progress";
import { languagePaths } from "@/lib/language-curriculum";

export const metadata = { title: "Detalle de usuario" };

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, disabledAt: true, createdAt: true, _count: { select: { submissions: { where: { diagnosticItemId: null } }, drafts: true } }, submissions: { where: { diagnosticItemId: null }, orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } }, drafts: { orderBy: { updatedAt: "desc" }, take: 1, select: { updatedAt: true } }, practiceContexts: { orderBy: { visitedAt: "desc" }, take: 1, select: { visitedAt: true } } } });
  if (!user) notFound();
  const [catalogs, paths, passed, failed] = await Promise.all([
    Promise.all(languages.map(language => getCatalog(id, language))),
    db.learningPath.findMany({ orderBy: { order: "asc" }, select: { slug: true, title: true, items: { select: { exerciseId: true } } } }),
    db.submission.count({ where: { userId: id, diagnosticItemId: null, mode: "submit", status: "PASSED" } }),
    db.submission.count({ where: { userId: id, diagnosticItemId: null, mode: "submit", status: "FAILED" } }),
  ]);
  const latest = [user.submissions[0]?.createdAt, user.drafts[0]?.updatedAt, user.practiceContexts[0]?.visitedAt].filter((date): date is Date => !!date).sort((a, b) => b.getTime() - a.getTime())[0];
  const date = (value: Date) => new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(value);
  return <div className="page-container">
    <Link href="/admin/cuentas" className="text-link">Volver a usuarios</Link>
    <div className="page-intro mt-6"><div className="min-w-0"><h1 className="page-title wrap-anywhere">{user.name}</h1><p className="mt-2 break-all text-sm text-muted-foreground">{user.email}</p></div><div className="flex flex-wrap gap-2"><Badge variant="outline">{user.role}</Badge><Badge>{user.disabledAt ? "Desactivada" : "Activa"}</Badge></div></div>
    <dl className="mb-8 grid gap-4 rounded-xl bg-surface p-5 text-sm sm:grid-cols-2 lg:grid-cols-3">{[["Fecha de registro", date(user.createdAt)], ["Última actividad", latest ? date(latest) : "Sin actividad"], ["Ejecuciones", user._count.submissions], ["Comprobaciones correctas", passed], ["Comprobaciones incorrectas", failed], ["Borradores", user._count.drafts]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1">{value}</dd></div>)}</dl>
    <section aria-labelledby="access-title"><h2 id="access-title" className="section-title mb-4">Acceso y permisos</h2><AdminAccountControls key={`${user.role}-${!!user.disabledAt}`} userId={id} email={user.email} role={user.role} disabled={!!user.disabledAt} self={admin.id === id} /></section>
    <section aria-labelledby="account-progress-title" className="mt-10"><h2 id="account-progress-title" className="section-title">Progreso del catálogo actual</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Solo las comprobaciones completas superadas completan ejercicios. Los ejemplos y borradores no conceden progreso. Los datos históricos permanecen conservados.</p>
       <div className="mt-6 grid gap-8 lg:grid-cols-3">{languages.map((language, index) => { const catalog = catalogs[index]; return <section key={language} aria-label={`Progreso en ${languageNames[language]}`}><h3 className="text-base font-medium">{languageNames[language]}</h3><p className="mt-2 text-sm text-muted-foreground">{catalog.filter(item => item.solved).length} / {catalog.length} ejercicios resueltos</p><div className="mt-5 flex flex-col gap-5">{languagePaths(paths, catalog, language).map(path => { const ids = new Set(path.items.map(item => item.exerciseId)); const items = catalog.filter(item => ids.has(item.id)); const done = items.filter(item => item.solved).length; return <div key={path.slug}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{path.title}</span><span className="shrink-0 font-mono tabular-nums">{done} / {items.length}</span></div><Progress label={`${path.title} en ${languageNames[language]}`} value={done} max={items.length} /></div>; })}</div></section>; })}</div>
    </section>
  </div>;
}
