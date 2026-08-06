"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { OptimusSDKClient } from "@optimus/sdk";
import { GitRepository } from "@optimus/git";

/**
 * Page de gestion des intégrations de projets Git dans Optimus Dev.
 */
export default function ProjectsPage() {
  const [sdk] = useState(() => new OptimusSDKClient({ baseURL: "https://api.optimus.dev" }));
  const [repositories, setRepositories] = useState<GitRepository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const list = await sdk.listGitRepositories("github");
        setRepositories(list.length > 0 ? list : [
          {
            id: "repo-1",
            name: "optimus-dashboard",
            fullName: "optimus/optimus-dashboard",
            url: "https://github.com/optimus/optimus-dashboard",
            defaultBranch: "main",
            isPrivate: true,
            owner: "optimus"
          },
          {
            id: "repo-2",
            name: "ai-orchestrator-core",
            fullName: "optimus/ai-orchestrator-core",
            url: "https://github.com/optimus/ai-orchestrator-core",
            defaultBranch: "main",
            isPrivate: true,
            owner: "optimus"
          }
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [sdk]);

  return (
    <PageLayout title="Projets Git">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold text-neutral-200">Dépôts et projets synchronisés</h3>
          <p className="text-xs text-neutral-400">Importez des dépôts depuis vos fournisseurs connectés (GitHub, GitLab, etc.).</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
          Importer un dépôt
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="divide-y divide-neutral-800">
          {repositories.map((repo) => (
            <div key={repo.id} className="p-6 flex items-center justify-between hover:bg-neutral-950/20 transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-neutral-100 text-base">{repo.name}</h4>
                  {repo.isPrivate && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                      Privé
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400">{repo.fullName} — Branche par défaut : <span className="font-mono text-neutral-300">{repo.defaultBranch}</span></p>
              </div>

              <div className="flex items-center space-x-3">
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-xs font-medium text-neutral-300 rounded-lg transition">
                  Ouvrir sur Git
                </a>
                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition">
                  Lancer Workspace
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
