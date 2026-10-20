import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "@/components/arc/motion.css";
import { MotionProvider } from "@/components/arc/motion-provider";

export const metadata: Metadata = { title: { default: "Itera — Un intento más cerca", template: "%s · Itera" }, description: "Tu espacio para aprender y fortalecer la lógica de programación. Practica a tu ritmo, en tu computadora.", robots: { index: false, follow: false } };

export default function RootLayout({ children, panel }: Readonly<{ children: React.ReactNode; panel?: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><body><ThemeProvider><MotionProvider><a href="#main-content" className="skip-link">Saltar al contenido</a>{children}{panel}</MotionProvider></ThemeProvider></body></html>;
}
