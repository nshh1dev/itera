import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { ReactivateAccountButton } from "@/components/reactivate-account-button";

export const metadata = { title: "Cuentas desactivadas" };

export default async function AccountsPage() {
  await requireAdmin();
  const users = await db.user.findMany({ where: { disabledAt: { not: null } }, orderBy: { disabledAt: "desc" }, select: { id: true, name: true, email: true } });
  return <div className="page-container">
    <Link href="/admin" className="text-link">Volver a Administración</Link>
    <h1 className="page-title mt-6">Cuentas desactivadas</h1>
    <p className="mt-3 text-sm text-muted-foreground">Reactivar permite iniciar sesión de nuevo. El progreso y los borradores se conservan; las sesiones anteriores no se recuperan.</p>
    {users.length ? <ul className="mt-7 flex flex-col gap-2">{users.map(user => <li key={user.id} className="list-entry flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0"><h2 className="break-words text-sm font-medium">{user.name}</h2><p className="break-all text-sm text-muted-foreground">{user.email}</p></div>
      <ReactivateAccountButton userId={user.id} />
    </li>)}</ul> : <p role="status" className="mt-7 text-sm text-muted-foreground">No hay cuentas desactivadas.</p>}
  </div>;
}
