"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { OptimusSDKClient } from "@optimus/sdk";
import { OptimusTeam } from "@optimus/api";

/**
 * Page de gestion des équipes de développement Optimus Dev.
 */
export default function TeamsPage() {
  const [sdk] = useState(() => new OptimusSDKClient({ baseURL: "https://api.optimus.dev" }));
  const [teams, setTeams] = useState<OptimusTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const list = await sdk.listTeams("org-123");
        setTeams(list.length > 0 ? list : [
          {
            id: "team-1",
            orgId: "org-123",
            name: "Équipe Core Platform",
            membersCount: 8
          },
          {
            id: "team-2",
            orgId: "org-123",
            name: "Équipe AI & Assistants",
            membersCount: 4
          }
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [sdk]);

  return (
    <PageLayout title="Équipes">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold text-neutral-200">Gérez vos équipes et collaborateurs</h3>
          <p className="text-xs text-neutral-400">Regroupez vos développeurs et assignez-leur des rôles et autorisations d'infrastructures.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
          Créer une équipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-neutral-100 text-base">{team.name}</h4>
              <p className="text-xs text-neutral-400">{team.membersCount} membres enregistrés</p>
            </div>
            <button className="px-3 py-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 rounded-lg transition">
              Gérer les membres
            </button>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
