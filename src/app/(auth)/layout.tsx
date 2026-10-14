import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
export default function AuthLayout({ children }: { children: React.ReactNode }) { return <div className="flex min-h-dvh flex-col"><header className="flex h-24 items-center justify-between px-6 sm:px-12"><Logo href="/" /><ThemeToggle /></header><main id="main-content" className="flex flex-1 items-center justify-center px-6 py-14">{children}</main><footer className="px-6 py-8 text-center text-xs text-muted-foreground">Solo en tu computadora. Sin suscripciones.</footer></div>; }
