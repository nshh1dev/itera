import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Itera — Un intento más cerca", template: "%s · Itera" }, description: "Tu espacio para aprender y fortalecer la lógica de programación. Practica Python y JavaScript a tu ritmo, en tu computadora.", robots: { index: false, follow: false } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><body><ThemeProvider><a href="#main-content" className="skip-link">Saltar al contenido</a>{children}</ThemeProvider></body></html>;
}
