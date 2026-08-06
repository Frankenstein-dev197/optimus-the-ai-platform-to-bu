"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@optimus/auth";
import { OptimusSDKClient } from "@optimus/sdk";
import {
  OptimusWorkspace,
  OptimusApiKey,
  OptimusGitIntegrationConfig
} from "@optimus/api";

/**
 * Portail principal de l'application officielle Optimus Dev (apps/coder).
 * Consomme exclusivement l'authentification unifiée via `@optimus/auth`
 * et orchestre l'accès aux APIs de la Gateway via le client de `@optimus/sdk`.
 */
export default function OptimusDevDashboard() {
  const auth = useAuth();
  const [sdk] = useState(() => new OptimusSDKClient({ baseURL: "https://api.optimus.dev" }));

  // États de simulation des données d'API
  const [workspaces, setWorkspaces] = useState<OptimusWorkspace[]>([]);
  const [apiKeys, setApiKeys] = useState<OptimusApiKey[]>([]);
  const [gitAccounts, setGitAccounts] = useState<OptimusGitIntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronisation du jeton d'authentification SSO
  useEffect(() => {
    if (auth.session) {
      sdk.setToken("sso_session_mock_token");
    }
  }, [auth.session, sdk]);

  // Chargement simulé des données d'API de la Gateway
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // En conditions réelles, ces appels requêtent la Gateway apps/platform
        // Ici, nous utilisons les stubs d'abstraction du SDK unifié
        const workspaceList = await sdk.listWorkspaces();
        const keysList = await sdk.listApiKeys();
        const gitList = await sdk.listLinkedGitAccounts();

        // Hydratation de secours de démo pour l'affichage visuel
        setWorkspaces(workspaceList.length > 0 ? workspaceList : [
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

        setApiKeys(keysList.length > 0 ? keysList : [
          {
            id: "key-1",
            name: "Pipeline CI/CD Production",
            prefix: "opt_dev_prod_6a2b",
            userId: "user-123",
            scopes: ["api:read", "api:write"],
            createdAt: new Date().toISOString()
          }
        ]);

        setGitAccounts(gitList.length > 0 ? gitList : [
          {
            userId: "user-123",
            providerId: "github",
            hasActiveToken: true,
            linkedAccountName: "optimus-developer-github"
          }
        ]);

      } catch (e) {
        console.error("Erreur de chargement des données Optimus Dev:", e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [sdk]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col">
      {/* Barre de navigation principale rebranded */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Logo d'emplacement Optimus Dev */}
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
            Ω
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Optimus Dev</h1>
            <p className="text-xs text-neutral-400">Environnements Cloud & Assistants IA unifiés</p>
          </div>
        </div>

        {/* Profil de l'utilisateur connecté via SSO */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium">optimus_developer</p>
            <p className="text-xs text-neutral-400">Rôle : Développeur</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-semibold">
            OD
          </div>
        </div>
      </header>

      {/* Corps du tableau de bord */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">

        {/* Entête d'accueil */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-neutral-900/50 to-neutral-900/50 border border-indigo-900/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Bienvenue sur Optimus Dev Portal</h2>
            <p className="text-neutral-400 text-sm max-w-2xl">
              Votre portail d'ingénierie tout-en-un. Provisionnez vos espaces de travail sécurisés, gérez vos intégrations Git (GitHub, GitLab, Gitea) et pilotez vos assistants autonomes IA.
            </p>
          </div>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/10">
            Nouveau Workspace
          </button>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Liste des Workspaces (2/3 de la largeur) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-semibold tracking-tight text-neutral-200">Espaces de travail actifs (Workspaces)</h3>

            {loading ? (
              <div className="border border-neutral-800 bg-neutral-900/20 rounded-2xl p-12 text-center text-neutral-400 text-sm">
                Chargement des environnements de développement...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspaces.map((ws) => (
                  <div key={ws.id} className="border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/60 transition rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-neutral-100">{ws.name}</h4>
                        <p className="text-xs text-neutral-400">{ws.templateName} (v{ws.templateVersion})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xxs font-medium ${
                        ws.status === 'running'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {ws.status === 'running' ? 'Actif' : 'Arrêté'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xxs border-t border-b border-neutral-800/60 py-3">
                      <div>
                        <p className="text-neutral-400">Processeur</p>
                        <p className="font-semibold mt-0.5">{ws.resources.cpuCores} Coeurs</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Mémoire</p>
                        <p className="font-semibold mt-0.5">{ws.resources.memoryGB} Go</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Disque NVMe</p>
                        <p className="font-semibold mt-0.5">{ws.resources.diskGB} Go</p>
                      </div>
                    </div>

                    {ws.gitRepoUrl && (
                      <div className="flex items-center space-x-2 text-xxs text-neutral-400">
                        <span className="font-medium text-neutral-300">Git :</span>
                        <span className="truncate">{ws.gitRepoUrl.split("/").slice(-2).join("/")}</span>
                        <span className="px-1 py-0.5 bg-neutral-800 rounded font-mono text-neutral-400">{ws.activeBranch}</span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      {ws.status === 'running' ? (
                        <>
                          <button className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition">
                            Arrêter
                          </button>
                          <button className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition">
                            Ouvrir IDE
                          </button>
                        </>
                      ) : (
                        <button className="w-full py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-medium rounded-lg transition border border-indigo-500/20">
                          Démarrer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Intégrations développeur (1/3 de la largeur) */}
          <div className="space-y-8">

            {/* Clés d'API Développeur */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight text-neutral-200">Clés d'API Actives</h3>
              <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-5 space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex justify-between items-center text-xs border-b border-neutral-800/40 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-neutral-200">{key.name}</p>
                      <p className="font-mono text-neutral-400 text-xxs mt-0.5">{key.prefix}••••••••</p>
                    </div>
                    <button className="text-red-400 hover:text-red-300 text-xxs transition font-medium">
                      Révoquer
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comptes Git Associés */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight text-neutral-200">Fournisseurs Git liés</h3>
              <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-5 space-y-4">
                {gitAccounts.map((acc, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="capitalize font-semibold text-neutral-200">{acc.providerId}</span>
                      <span className="text-xxs text-neutral-400">({acc.linkedAccountName})</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xxs font-medium">
                      Connecté
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Pied de page du portail */}
      <footer className="border-t border-neutral-800 bg-neutral-900/20 py-4 px-6 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} Optimus Dev - Intégration de plateformes cloud et IA sécurisées.</p>
      </footer>
    </div>
  );
}
