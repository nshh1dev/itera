"use client";

import Link from "next/link";
import { useRef } from "react";
import { LogOut, Settings2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import type { ShellUser } from "./app-shell";

export function AccountMenu({ user, signingOut, onSignOut }: { user: ShellUser; signingOut: boolean; onSignOut: () => void }) {
  const trigger = useRef<HTMLButtonElement>(null);
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><button ref={trigger} type="button" aria-label="Mi cuenta" title={user.name} className="ml-1 flex size-11 items-center justify-center rounded-full border bg-surface text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:size-8">{user.name.slice(0, 1).toUpperCase()}</button></DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuGroup>
        <DropdownMenuLabel className="flex max-w-72 flex-col gap-1 px-3 py-2"><span className="break-words text-sm font-medium">{user.name}</span><span className="break-all text-xs font-normal text-muted-foreground">{user.email}</span></DropdownMenuLabel>
        <DropdownMenuItem asChild><Link href="/configuracion"><Settings2 aria-hidden="true" />Configuración</Link></DropdownMenuItem>
        <DropdownMenuItem disabled={signingOut} onSelect={onSignOut}><LogOut aria-hidden="true" />{signingOut ? "Cerrando sesión…" : "Cerrar sesión"}</DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
