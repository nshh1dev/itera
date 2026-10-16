"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { announceThemeChange } from "@/lib/motion";
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return <Button variant="ghost" size="icon" aria-label="Cambiar tema claro u oscuro" title="Cambiar apariencia" onClick={() => { announceThemeChange(); setTheme(resolvedTheme === "dark" ? "light" : "dark"); }}><Sun className="hidden dark:block" /><Moon className="dark:hidden" /></Button>;
}
