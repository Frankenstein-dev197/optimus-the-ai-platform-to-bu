"use client";

import React, { useState } from "react";
import { PageLayout } from "../../components/layout/PageLayout";

/**
 * Page de configuration des paramètres du profil utilisateur unifié d'Optimus Dev.
 */
export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState(true);

  return (
    <PageLayout title="Paramètres">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-2xl space-y-6">
        <h3 className="text-lg font-bold text-neutral-100 border-b border-neutral-800 pb-4">Préférences du portail développeur</h3>

        {/* Paramètre de thème */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <h4 className="font-semibold text-neutral-200">Thème graphique</h4>
            <p className="text-xs text-neutral-400 mt-1">Sélectionnez le mode d'affichage visuel de l'interface.</p>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="dark">Sombre (Optimus Dark)</option>
            <option value="light">Clair (Optimus Light)</option>
            <option value="system">Système</option>
          </select>
        </div>

        {/* Paramètre de notifications */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <h4 className="font-semibold text-neutral-200">Notifications de Provisioning</h4>
            <p className="text-xs text-neutral-400 mt-1">Recevoir un e-mail ou un événement système lors de la création d'un workspace.</p>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-neutral-800"
          />
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
            Sauvegarder les modifications
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
