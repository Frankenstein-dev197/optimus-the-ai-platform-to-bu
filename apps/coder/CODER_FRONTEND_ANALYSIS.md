# Analyse d'Intégration et d'Adaptation : Frontend Coder vers Optimus Dev

Ce document présente l'analyse approfondie du frontend open source de la plateforme **Coder** (v2) et détaille notre stratégie technique pour l'adapter et l'intégrer de manière transparente comme deuxième application officielle au sein du monorepo **Optimus** sous le nom public d'**Optimus Dev** (`apps/coder`).

---

## 1. Analyse de la Structure du Frontend Coder Original

La base de code d'origine de l'interface utilisateur de Coder (située dans le dossier `site/` du projet Coder) repose sur une architecture Single Page Application (SPA) classique et robuste :

### 1.1 Stack Technique Identifiée
- **Framework UI** : React (v18) écrit exclusivement en TypeScript.
- **Gestionnaire d'État et Requêtes** : TanStack Query (React Query v4) pour le cache asynchrone du serveur, complété par Axios comme client HTTP unifié.
- **Routage** : `react-router-dom` (v6) pour la navigation de la SPA, avec des composants de mise en page (`<DashboardLayout>`) et de protection des routes d'authentification (`<RequireAuth>`).
- **Design System & Composants** : Material UI v5 (MUI) configuré avec Emotion CSS pour l'ensemble des éléments graphiques, formulaires et grilles.
- **Formulaires** : Formik associé à Yup pour les schémas de validation.
- **Gestionnaire de Build** : Vite servant l'application de manière autonome (SPA statique).
- **Tests** : Vitest pour les tests unitaires et d'intégration, Playwright pour les tests fonctionnels de bout en bout (E2E) exécutés contre une base de données de test réelle.

### 1.2 Structure des Répertoires Coder (`site/`)
```
site/
 ├── src/
 │    ├── @types/          # Déclarations de types additionnels
 │    ├── api/             # Client Axios (api.ts) et types autogénérés de Go (typesGenerated.ts)
 │    │    └── queries/    # Requêtes et mutations TanStack Query
 │    ├── components/      # Composants atomiques réutilisables sans logique métier
 │    ├── hooks/           # Hooks personnalisés transversaux
 │    ├── modules/         # Composants et logiques spécifiques à Coder (ex: Provisioner, Terminal)
 │    ├── pages/           # Pages de premier niveau (Workspaces, Users, Templates, Settings)
 │    ├── theme/           # Configuration du thème Material UI
 │    └── util/            # Fonctions utilitaires génériques
 ├── static/               # Actifs statiques (logos, images, polices)
 └── package.json
```

---

## 2. Décisions de Migration : Ce qui est Conservé, Adapté, Remplacé ou Supprimé

Pour intégrer cette application dans le monorepo **Optimus** tout en garantissant l'alignement sur notre charte technique et notre modèle de déploiement (Vercel), nous adoptons la stratégie suivante :

### 2.1 Ce qui est CONSERVÉ
- **La structure générale des Pages et des Modules métier** : Les écrans de gestion des espaces de travail, de configuration des agents, de sélection de templates et d'affichage des paramètres utilisateurs ont fait l'objet de centaines d'heures d'UX. Nous conservons leur structure logique et visuelle générale pour préserver l'efficacité opérationnelle.
- **L'utilisation de TypeScript strict** : Pour maintenir la robustesse de l'application et la synchronisation avec le reste du monorepo.
- **La structure de l'agent terminal (Web Terminal)** : Les composants hautement interactifs (comme xterm.js pour le terminal web et le tunneling de port) sont conservés car essentiels à l'interactivité de la plateforme de développement.

### 2.2 Ce qui est ADAPTÉ
- **Le Thème Graphique (MUI + Emotion)** : Le thème de Coder doit être adapté pour refléter l'identité visuelle d'**Optimus Dev**. Les palettes de couleurs (violets néon, bleus, neutres très sombres d'Optimus) seront injectées dans le `ThemeProvider` de MUI.
- **La Gestion du Routage** : Migration de l'application vers l'**App Router de Next.js** utilisé par le monorepo Optimus. La structure des routes passera d'un fichier de routage statique `react-router` à une arborescence de fichiers Next.js (`app/dashboard`, `app/workspaces`, `app/projects`, etc.), ce qui améliore les performances et permet une intégration SSO plus fluide.

### 2.3 Ce qui est REMPLACÉ
- **Les appels directs aux API Coder (Remplacement Majeur)** : **INTERDICTION** d'effectuer des requêtes directes à l'API de Coder. Tout appel réseau doit être remplacé par des appels passant exclusivement par notre SDK unifié **`@optimus/sdk`** (qui consomme les contrats de `@optimus/api`). Cela garantit que l'interface frontend d'Optimus Dev est totalement découplée du moteur backend Coder.
- **L'Authentification (Remplacement Majeur)** : Le module d'authentification de Coder est remplacé par l'authentification SSO unifiée d'**`@optimus/auth`**. La session de l'utilisateur connecté sur la landing page d'Optimus (`apps/web`) est automatiquement propagée à l'application Optimus Dev (`apps/coder`) via le système de cookies SSO partagés.
- **Les composants UI Génériques** : Remplacement des composants MUI simples (boutons, cartes simples, modales de confirmation) par des composants hautement optimisés issus de notre package commun **`@optimus/ui`**, réduisant le poids de l'application et harmonisant l'interface.

### 2.4 Ce qui est SUPPRIMÉ
- **Les fichiers d'API autogénérés de Go (`typesGenerated.ts`)** : Supprimés au profit des types universels et extensibles déclarés dans notre package unifié `@optimus/api`.
- **L'intégration directe avec des bases de données ou sessions autonomes** : L'authentification, la facturation et les métadonnées de l'utilisateur sont désormais centralisées au niveau de la Gateway de la plateforme (`apps/platform`).

---

## 3. Architecture d'Intégration Cible au sein du Monorepo

```
                        ┌────────────────────────┐
                        │        apps/web        │ (Landing / Site vitrine)
                        └───────────┬────────────┘
                                    │
                                    │ SSO Cookie
                                    ▼
                        ┌────────────────────────┐
                        │  apps/coder (Optimus)  │ (Interface Optimus Dev)
                        └───────────┬────────────┘
                                    │
                                    │ Appels SDK Unifiés
                                    ▼
                        ┌────────────────────────┐
                        │      @optimus/sdk      │ (Abstraction Client HTTP/WS)
                        └───────────┬────────────┘
                                    │
                                    │ Protocoles Réseau
                                    ▼
                        ┌────────────────────────┐
                        │     apps/platform      │ (Gateway de Plateforme)
                        └────────────────────────┘
```

### 3.1 Intégration de `@optimus/sdk` et `@optimus/auth`
- Le frontend d'Optimus Dev initialise une instance globale du client d'API à l'aide de `@optimus/sdk`.
- Lors du démarrage, l'application exécute le hook `useAuth()` de `@optimus/auth`. Si le cookie SSO `.optimus.dev` est présent et valide, l'utilisateur est connecté de manière transparente, ses permissions et son rôle sont injectés dans le contexte de l'interface, et les en-têtes d'autorisation d'API sont automatiquement configurés.

---

## 4. Stratégie de Rebranding Complet

La marque "Coder" ou toute autre marque associée d'origine (comme "code-server") doit disparaître complètement au profit d'**Optimus Dev** :

| Élément d'origine | Remplacement par Optimus Dev | Méthode d'adaptation |
| :--- | :--- | :--- |
| **Logos & Iconographie** | Logos officiels d'Optimus (variantes claire/sombre). | Remplacement des fichiers dans `static/` et mise à jour des favicons. |
| **Titres de pages (SEO)** | "Optimus Dev - Environnements de Développement Cloud & IA" | Configuration des balises de métadonnées Next.js (`layout.tsx`). |
| **Mentions textuelles** | "Optimus Dev" ou "Espaces de travail Optimus" | Script de remplacement global de texte combiné à une revue d'assurance qualité. |
| **Documentation utilisateur** | Guides d'aide officiels d'Optimus Dev. | Réécriture de la section d'aide pour pointer vers `docs.optimus.dev`. |

---

## 5. Feuille de Route d'Intégration Progressive

1. **Étape 1 (Réalisée)** : Rédaction de l'analyse d'architecture et définition des fondations de l'application `apps/coder`.
2. **Étape 2 (Réalisée)** : Création de la structure de répertoires Next.js conforme au monorepo (`app/`, `components/`, etc.) et mise en place du layout principal d'administration (sidebar, header, zones utilisateurs).
3. **Étape 3** : Importation progressive des pages et des composants complexes (comme la console d'administration et la configuration des workspaces) et ré-écriture systématique de leurs requêtes pour utiliser `@optimus/sdk`.
4. **Étape 4** : Finalisation du rebranding textuel et graphique au sein de tous les composants importés.
5. **Étape 5** : Lancement d'une phase de tests d'intégration (E2E) à l'échelle du monorepo pour garantir une expérience utilisateur fluide et sans régression.
