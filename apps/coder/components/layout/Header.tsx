"use client";

import React from "react";
import { useAuth } from "@optimus/auth";

export interface HeaderProps {
  readonly title: string;
}

/**
 * Composant de barre d'entête (Header) principal pour l'application Optimus Dev.
 * Intègre la gestion du statut utilisateur et de session via SSO.
 */
export function Header({ title }: HeaderProps) {
  const auth = useAuth();

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-900/40 backdrop-blur-md flex items-center justify-between px-8 text-neutral-200">
      <h2 className="font-bold text-lg tracking-tight text-neutral-100">{title}</h2>

      <div className="flex items-center space-x-6">
        {/* Assistants IA & Connecteurs Status */}
        <div className="hidden md:flex items-center space-x-3 text-xs bg-neutral-800/40 border border-neutral-800 rounded-full px-3 py-1">
          <span className="text-neutral-400">Assistant IA :</span>
          <span className="text-indigo-400 font-semibold flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" /> Prêt
          </span>
        </div>

        {/* Profil utilisateur SSO unifié */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-neutral-100">optimus_developer</p>
            <p className="text-xxs text-neutral-400">Rôle : Développeur</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-indigo-400 shadow-inner">
            OD
          </div>
        </div>
      </div>
    </header>
  );
}
