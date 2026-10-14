import { AppShell } from "@/components/app-shell";
import { currentUser } from "@/server/auth";
export const dynamic = "force-dynamic";
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return <AppShell user={user ? { name: user.name, email: user.email, role: user.role } : null}>{children}</AppShell>;
}
