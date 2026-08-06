"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { OptimusSDKClient } from "@optimus/sdk";
import { OptimusWorkspace } from "@optimus/api";

export default function DashboardPage() {
  const [sdk] = useState(() => new OptimusSDKClient({ baseURL: "https://api.optimus.dev" }));
  const [workspaces, setWorkspaces] = useState<OptimusWorkspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const list = await sdk.listWorkspaces();
        // Hydratation de simulation pour démo visuelle
        setWorkspaces(list.length > 0 ? list : [
          {
            id: "ws-1",
            name: "back-office-optimus",
            ownerId: "user-123",
            ownerUsername: "optimus_developer",
            status: "running",
            templateId: "tpl-node",
            templateName: "NodeJS & Docker Environment",
            templateVersion: "1.2.0",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resources: { cpuCores: 2, memoryGB: 4, diskGB: 20 },
            gitRepoUrl: "https://github.com/optimus/back-office-optimus",
            activeBranch: "main"
          }
        ]);
      } catch (e) {
        console.error("Erreur d'appel API:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, [sdk]);

  return (
    <PageLayout title="Tableau de bord">
      {/* Résumé de consommation et activité */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Workspaces Actifs</p>
          <h3 className="text-3xl font-extrabold mt-2 text-indigo-400">
            {workspaces.filter(w => w.status === 'running').length} / {workspaces.length}
          </h3>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Cœurs CPU Alloués</p>
          <h3 className="text-3xl font-extrabold mt-2 text-neutral-100">
            {workspaces.reduce((acc, w) => acc + (w.status === 'running' ? w.resources.cpuCores : 0), 0)} Coeurs
          </h3>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Facturation Estimée</p>
          <h3 className="text-3xl font-extrabold mt-2 text-emerald-400">12.50 USD</h3>
        </div>
      </div>

      {/* Guide d'onboarding rapide */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-neutral-100">Démarrage rapide</h3>
        <p className="text-sm text-neutral-400">
          Pour lancer une session de codage, sélectionnez ou démarrez un espace de travail actif, ou importez un nouveau dépôt Git pour créer un nouvel environnement personnalisé.
        </p>
      </div>
    </PageLayout>
  );
}
