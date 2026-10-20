import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Gestión de usuarios" };

export default async function AccountsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const str = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = str("q").trim().slice(0, 254);
  const role = str("rol") === "ADMIN" || str("rol") === "USER" ? str("rol") as "ADMIN" | "USER" : undefined;
  const state = str("estado") === "activas" || str("estado") === "desactivadas" ? str("estado") : "";
  const where: Prisma.UserWhereInput = { ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}), ...(role ? { role } : {}), ...(state ? { disabledAt: state === "activas" ? null : { not: null } } : {}) };
  const total = await db.user.count({ where });
  const pages = Math.max(1, Math.ceil(total / 20));
  const page = Math.min(pages, Math.max(1, Number.parseInt(str("pagina")) || 1));
  const users = await db.user.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 20, take: 20, select: { id: true, name: true, email: true, role: true, disabledAt: true, createdAt: true, _count: { select: { progress: { where: { firstPassedAt: { not: null } } } } } } });
  const pageLink = (number: number) => `/admin/cuentas?${new URLSearchParams({ q, rol: role ?? "", estado: state, pagina: String(number) })}`;
  return <div className="page-container">
    <Link href="/admin" className="text-link">Volver a Administración</Link>
    <h1 className="page-title mt-6">Gestión de usuarios</h1>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Consulta el progreso y gestiona el acceso. Desactivar conserva todos los datos; no se eliminan cuentas.</p>
    <form className="mt-6 flex flex-wrap items-end gap-3">
      <label className="field-label min-w-0 flex-1 basis-56">Buscar por nombre o correo<input className="field mt-2" name="q" defaultValue={q} maxLength={254} type="search" /></label>
      <div><label className="field-label" htmlFor="account-role-filter">Rol</label><select id="account-role-filter" className="field mt-2" name="rol" defaultValue={role ?? ""}><option value="">Todos</option><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></div>
      <div><label className="field-label" htmlFor="account-state-filter">Estado</label><select id="account-state-filter" className="field mt-2" name="estado" defaultValue={state}><option value="">Todos</option><option value="activas">Activas</option><option value="desactivadas">Desactivadas</option></select></div>
      <Button type="submit" variant="secondary">Filtrar</Button><Button asChild variant="ghost"><Link href="/admin/cuentas">Limpiar filtros</Link></Button>
    </form>
    <p className="mt-6 text-sm text-muted-foreground">{total} cuentas · Las completaciones se cuentan por ejercicio y lenguaje, incluido el historial.</p>
    {users.length ? <ul className="mt-4 flex flex-col gap-1">{users.map(user => <li key={user.id}><Link href={`/admin/cuentas/${user.id}`} className="list-entry flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1 basis-56"><h2 className="wrap-anywhere text-sm font-medium">{user.name}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p></div>
      <div className="flex flex-wrap items-center gap-3"><Badge variant="outline">{user.role}</Badge><Badge>{user.disabledAt ? "Desactivada" : "Activa"}</Badge><span className="text-sm text-muted-foreground">{user._count.progress} completaciones</span><time className="text-sm text-muted-foreground" dateTime={user.createdAt.toISOString()}>Alta: {new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(user.createdAt)}</time></div>
    </Link></li>)}</ul> : <p role="status" className="mt-7 text-sm text-muted-foreground">No hay cuentas que coincidan con estos filtros.</p>}
    {pages > 1 && <nav aria-label="Paginación de usuarios" className="mt-6 flex items-center justify-between gap-3">{page > 1 ? <Link className="text-link" href={pageLink(page - 1)}>Anterior</Link> : <span />}<span className="text-sm text-muted-foreground">{page} de {pages}</span>{page < pages ? <Link className="text-link" href={pageLink(page + 1)}>Siguiente</Link> : <span />}</nav>}
  </div>;
}
