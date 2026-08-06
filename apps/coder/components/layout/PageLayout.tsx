"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export interface PageLayoutProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

/**
 * Mise en page (Layout) générale réutilisable pour toutes les pages d'administration d'Optimus Dev.
 * Centralise l'affichage de la barre de navigation latérale et de l'entête.
 */
export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex">
      {/* Sidebar de navigation latérale fixe */}
      <Sidebar />

      {/* Zone de contenu défilable principale */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <Header title={title} />

        <main className="flex-1 p-8 overflow-y-auto max-w-6xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
