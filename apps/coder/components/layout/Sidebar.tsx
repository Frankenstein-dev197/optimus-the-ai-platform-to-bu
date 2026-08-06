"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarProps {
  readonly currentOrg?: string;
}

/**
 * Composant de navigation latérale (Sidebar) principal d'Optimus Dev.
 * Fournit l'accès unifié aux différents domaines (Workspaces, Projects, Teams, etc.).
 */
export function Sidebar({ currentOrg = "Optimus" }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Tableau de bord", path: "/dashboard", icon: "📊" },
    { name: "Workspaces", path: "/workspaces", icon: "💻" },
    { name: "Projets Git", path: "/projects", icon: "📁" },
    { name: "Équipes", path: "/teams", icon: "👥" },
    { name: "Paramètres", path: "/settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen fixed left-0 top-0 text-neutral-200">
      {/* Entête d'organisation */}
      <div className="p-6 border-b border-neutral-800 flex items-center space-x-3 bg-neutral-950/20">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
          Ω
        </div>
        <div>
          <h2 className="font-bold text-sm text-neutral-100 tracking-tight">Optimus Dev</h2>
          <p className="text-xxs text-neutral-400 truncate max-w-[120px]">{currentOrg}</p>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                  : "hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-100 border border-transparent"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pied de page de la Sidebar avec état SSO */}
      <div className="p-4 border-t border-neutral-800 text-xxs text-neutral-500 bg-neutral-950/20">
        <div className="flex items-center space-x-2 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SSO Optimus Connecté</span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-neutral-600">v0.1.0-foundation</p>
      </div>
    </aside>
  );
}
