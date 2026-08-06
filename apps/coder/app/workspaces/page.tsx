"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { OptimusSDKClient } from "@optimus/sdk";
import { OptimusWorkspace } from "@optimus/api";

/**
 * Page de gestion des espaces de travail (Workspaces) Optimus Dev.
 */
export default function WorkspacesPage() {
  const [sdk] = useState(() => new OptimusSDKClient({ baseURL: "https://api.optimus.dev" }));
  const [workspaces, setWorkspaces] = useState<OptimusWorkspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const list = await sdk.listWorkspaces();
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
          },
          {
            id: "ws-2",
            name: "optimus-ai-agent",
            ownerId: "user-123",
            ownerUsername: "optimus_developer",
            status: "stopped",
            templateId: "tpl-python",
            templateName: "Python & GPU Jupyter Environment",
            templateVersion: "2.0.1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resources: { cpuCores: 8, memoryGB: 32, diskGB: 100, gpuCount: 1 },
            gitRepoUrl: "https://github.com/optimus/optimus-ai-agent",
            activeBranch: "feature/local-inference"
          }
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspaces();
  }, [sdk]);

  return (
    <PageLayout title="Workspaces">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold text-neutral-200">Gérez vos environnements de développement cloud</h3>
          <p className="text-xs text-neutral-400">Démarrez, configurez ou supprimez vos workspaces en 1 clic.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
          Nouveau Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((ws) => (
          <div key={ws.id} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-neutral-100 text-lg">{ws.name}</h4>
                <p className="text-xs text-neutral-400 mt-1">{ws.templateName} (v{ws.templateVersion})</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xxs font-medium ${
                ws.status === 'running'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {ws.status === 'running' ? 'Actif' : 'Arrêté'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-b border-neutral-800 py-3 text-xxs">
              <div>
                <p className="text-neutral-400 uppercase tracking-wider">CPU</p>
                <p className="font-semibold text-neutral-200 mt-0.5">{ws.resources.cpuCores} Coeurs</p>
              </div>
              <div>
                <p className="text-neutral-400 uppercase tracking-wider">Mémoire</p>
                <p className="font-semibold text-neutral-200 mt-0.5">{ws.resources.memoryGB} Go</p>
              </div>
              <div>
                <p className="text-neutral-400 uppercase tracking-wider">Stockage</p>
                <p className="font-semibold text-neutral-200 mt-0.5">{ws.resources.diskGB} Go</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-neutral-500 text-xxs font-mono truncate max-w-[180px]">
                ID : {ws.id}
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition">
                  Configurer
                </button>
                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition">
                  Ouvrir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
