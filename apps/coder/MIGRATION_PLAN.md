# Plan de Migration et d'Architecture : Intégration de Coder (Optimus Dev)

Ce document présente l'analyse architecturale complète et le plan détaillé pour intégrer la plateforme de développement cloud open source **Coder** en tant que deuxième application officielle au sein du monorepo **Optimus**.

L'objectif est de faire de cette application (nom de code technique : `apps/coder`, nom public officiel : **Optimus Dev**) une extension naturelle et fluide de l'écosystème Optimus, tout en assurant un découplage total entre le moteur backend et l'interface frontend pour permettre des déploiements optimisés (Vercel pour le frontend, infrastructure dédiée pour le moteur backend).

---

## Sommaire

1. [Clarification de la Nomenclature (apps/coder vs Optimus Dev)](#1-clarification-de-la-nomenclature-appscoder-vs-optimus-dev)
2. [Analyse de l'Architecture de Coder](#2-analyse-de-larchitecture-de-coder)
3. [Stratégie de Découplage (Frontend Vercel & Backend Dédié)](#3-stratégie-de-découplage-frontend-vercel--backend-dédié)
4. [Architecture SSO Détaillée (apps/web ⟷ Optimus Dev)](#4-architecture-sso-détaillée-appsweb--optimus-dev)
5. [Couche d'Abstraction API : packages/api ou packages/sdk](#5-couche-dabstraction-api--packagesapi-ou-packagessdk)
6. [Services Développeur Optimus (Optimus Developer Services)](#6-services-développeur-optimus-optimus-developer-services)
7. [Intégration au Monorepo Optimus](#7-intégration-au-monorepo-optimus)
8. [Architecture Extensible pour les Services IA d'Optimus](#8-architecture-extensible-pour-les-services-ia-doptimus)
9. [Stratégie de Rebranding & White-Labeling](#9-stratégie-de-rebranding--white-labeling)
10. [Conformité avec la Licence AGPL-3.0 (Analyse Prudente)](#10-conformité-avec-la-licence-agpl-30-analyse-prudente)
11. [Plan de Migration Étape par Étape (Progressif & sans Interruption)](#11-plan-de-migration-étape-par-étape-progressif--sans-interruption)
12. [Justification et Avantages par rapport aux Alternatives](#12-justification-et-avantages-par-rapport-aux-alternatives)

---

## 1. Clarification de la Nomenclature (apps/coder vs Optimus Dev)

Pour éviter toute confusion tout au long du cycle de développement et de maintenance du projet, nous établissons une distinction claire entre les désignations techniques et publiques :

- **`apps/coder` (Nom Technique de Répertoire)** : C'est le nom de code physique du dossier au sein du monorepo pnpm. Conserver cette appellation dans la structure du code permet d'identifier immédiatement l'origine technologique de la base de code, de faciliter la traçabilité des imports de commits amonts (upstreams), et de maintenir une correspondance directe avec la documentation d'architecture d'origine.
- **Optimus Dev (Nom Public de Produit)** : C'est le nom de marque exclusif présenté à l'utilisateur final. Aucun client ou développeur externe ne verra de référence à "Coder" ou "apps/coder" dans l'interface de production. Toutes les interfaces graphiques, logos, documentations d'utilisation, domaines d'accès (ex. `dev.optimus.dev` ou `optimus.dev/dev`) et communications utiliseront exclusivement la marque **Optimus Dev**.

---

## 2. Analyse de l'Architecture de Coder

Pour réussir l'intégration d'une plateforme complexe comme Coder, il est essentiel d'en comprendre la structure actuelle.

### 2.1 Le Backend / Moteur (Go)
Le backend de Coder est un binaire unique et autonome écrit en **Go**. Il assure de multiples rôles critiques :
- **Serveur de API/REST & WebSocket** : Point d'entrée pour toutes les actions de configuration et d'interactivité.
- **Moteur de Provisioning (Terraform)** : Gestion du cycle de vie des espaces de travail (workspaces) sur AWS, GCP, Azure, Kubernetes, Docker, etc.
- **Coordination réseau (WireGuard®)** : Établissement de connexions de bout en bout hautement sécurisées et chiffrées entre l'utilisateur local, le serveur, et les agents s'exécutant dans les espaces de travail.
- **Serveur d'agents** : Les agents s'exécutent au sein des workspaces et communiquent en temps réel avec le serveur central pour l'exécution des commandes, le transfert de fichiers, et le tunnel de ports (Port Forwarding).
- **Service de fichiers statiques** : Par défaut, le binaire Go compile et sert directement l'interface React compilée.

### 2.2 Le Frontend / Interface (SPA React)
L'interface utilisateur de Coder est une Single Page Application (SPA) située dans le répertoire `site/` du dépôt d'origine :
- **Framework** : React avec TypeScript.
- **Gestionnaire de build** : Vite.
- **Styles & UI** : Material UI v5 (MUI) associé à Emotion CSS.
- **Routing** : `react-router` v6 (avec gestion des routes privées `<RequireAuth>` et de la structure du tableau de bord `<DashboardLayout>`).
- **Gestion d'état & Requêtes** : TanStack Query (React Query) v4 pour la synchronisation du cache serveur et Axios pour les appels HTTP.
- **Formulaires** : Formik complété par Yup pour les validations de schéma.
- **Tests** : Playwright pour l'E2E, Vitest pour les tests unitaires, et Storybook pour les tests visuels.

---

## 3. Stratégie de Découplage (Frontend Vercel & Backend Dédié)

### 3.1 Le Problème du Découplage sur Vercel
Vercel est une plateforme conçue pour le serverless et la distribution de contenus statiques à la périphérie (Edge). Le moteur de Coder **ne peut pas** être exécuté au sein de fonctions serverless Vercel car il requiert :
1. Des connexions réseau TCP/UDP persistantes à long terme (tunnels WireGuard).
2. L'exécution de processus d'arrière-plan durables (moteur Terraform, agents en écoute).
3. Des connexions WebSocket hautement interactives et persistantes (terminaux Web intégrés, SSH sur navigateur).

### 3.2 L'Architecture Cible Proposée

Pour surmonter cela, nous allons séparer de façon stricte l'interface utilisateur et le moteur :

```
                  ┌──────────────────────────────────────────────┐
                  │              Navigateur Client               │
                  └──────────────┬────────────────┬──────────────┘
                                 │                │
               Requêtes HTTPS    │                │  WebSockets (Terminal, Agent)
               & Fichiers HTML   │                │  (Connexion Directe / Proxy)
                                 ▼                ▼
                  ┌────────────────────────┐    ┌────────────────────────┐
                  │    Frontend Vercel     │    │     Optimus Engine     │
                  │  (apps/coder - Next.js)│    │      (Backend Go)      │
                  │                        │    │                        │
                  │   - @optimus/ui        │    │  - Terraform Runner    │
                  │   - @optimus/api (SDK) │    │  - WireGuard Tunnels   │
                  └────────────────────────┘    └────────────────────────┘
```

#### A. Le Frontend (`apps/coder`) déployé sur Vercel
L'interface sera isolée sous forme d'application autonome. Elle sera compilée de manière statique (SSG) ou gérée sous forme de SPA hébergée sur Vercel. Toutes ses requêtes réseau seront redirigées vers le moteur backend.

#### B. Le Moteur (`Optimus Engine` - Backend Go) déployé indépendamment
Le moteur d'exécution Go sera hébergé sur une infrastructure dédiée et pérenne (par exemple, un cluster Kubernetes, des instances AWS EC2, ou des serveurs Linux sécurisés). Cela garantit la stabilité de Terraform et des connexions WireGuard.

#### C. Gestion de la Communication : HTTP, CORS et WebSockets
1. **Reverse Proxy & Redirections (Recommandé)** :
   Pour éviter les tracas liés au CORS (Cross-Origin Resource Sharing) et simplifier l'authentification basée sur les cookies de session (`HttpOnly`, `SameSite=Lax`, `Secure`), nous utiliserons la fonction **Vercel Rewrites** (définie dans `vercel.json` ou `next.config.mjs`).
   Toute requête vers `https://dev.optimus.dev/api/*` sera redirigée de manière transparente à la périphérie de Vercel vers le moteur backend Go exécuté sur `https://engine.optimus.dev/api/*`.
2. **WebSocket Bypass** :
   Les connexions WebSocket durables (ex. `/api/v2/workspaceagents/{id}/pty`) de Vercel peuvent être limitées par les timeouts serverless.
   **Solution** : Dans le code du frontend, nous configurerons l'URL d'établissement des WebSockets pour qu'elle pointe **directement** vers le domaine d'exécution du moteur Go (ex. `wss://engine.optimus.dev/...`). Cela permet de contourner les limites de Vercel pour les sessions de terminal interactif.

---

## 4. Architecture SSO Détaillée (apps/web ⟷ Optimus Dev)

Pour offrir une expérience fluide, un utilisateur connecté sur la Landing Page principale (`apps/web`) doit accéder instantanément à son espace de développement `Optimus Dev` (`apps/coder`) sans avoir à se reconnecter.

### 4.1 Mécanisme SSO proposé (Partage de Domaine & Session)

Nous proposons une architecture SSO basée sur un **domaine parent partagé** (ex. `optimus.dev`) et des jetons JWT (JSON Web Tokens) sécurisés et éphémères.

```
┌──────────────┐         1. Connexion / Login         ┌───────────────┐
│  Utilisateur ├─────────────────────────────────────►│   apps/web    │
│  (Navigateur)│◄─────────────────────────────────────┤ (NextJS Auth) │
└──────┬───────┘    2. Fixe Cookie Session (.optimus.dev)  └───────────────┘
       │
       │            3. Navigation vers Optimus Dev (apps/coder)
       ├──────────────────────────────────────────────────────┐
       │                                                      ▼
       │  4. Envoie Cookie de Session Partagé        ┌────────────────┐
       ├────────────────────────────────────────────►│   apps/coder   │
       │                                             │ (Optimus Dev)  │
       │  5. Échange de Token / Validation Session   └───────┬────────┘
       │◄────────────────────────────────────────────────────┘
       ▼
┌──────────────┐            6. Requête API SSO          ┌──────────────┐
│  Optimus Dev ├───────────────────────────────────────►│  ID Provider │
│   Engine     │◄───────────────────────────────────────┤ (Auth Server)│
└──────────────┘         7. Token Validé (User OK)      └──────────────┘
```

### 4.2 Flux d'Authentification Étape par Étape

1. **Session Globale (`apps/web`)** :
   L'utilisateur s'authentifie sur `https://optimus.dev`. Le serveur d'authentification d'Optimus génère un cookie de session chiffré. Ce cookie est configuré avec l'attribut `Domain=.optimus.dev`, ce qui le rend accessible à tous les sous-domaines, y compris `https://dev.optimus.dev`.
2. **Transition vers `Optimus Dev` (`apps/coder`)** :
   Lorsque l'utilisateur clique sur "Accéder à mes espaces de travail", il est redirigé vers `https://dev.optimus.dev`. Le navigateur transmet automatiquement le cookie de session partagé `.optimus.dev`.
3. **Validation & Échange de Jeton par l'API Gateway** :
   Le frontend d'Optimus Dev intercepte le cookie et effectue une requête silencieuse vers l'endpoint d'authentification d'Optimus Dev Engine. Le moteur backend d'Optimus Dev valide le cookie auprès du serveur d'authentification central d'Optimus (Identity Provider - IdP).
4. **Génération de Session Locale Coder** :
   Une fois validé, Optimus Dev Engine génère une session utilisateur interne Coder et retourne un token JWT local ou un cookie d'API dédié à l'application `apps/coder`. L'utilisateur accède instantanément à ses espaces de travail sans aucune friction.
5. **Gestion du Logout Unifié (Single Sign-Out)** :
   Une déconnexion initiée depuis n'importe quelle application (`apps/web` ou `apps/coder`) détruira le cookie global `.optimus.dev` et enverra une requête d'invalidation (back-channel logout) à l'API Gateway d'Optimus Dev Engine pour révoquer immédiatement la session locale.

---

## 5. Couche d'Abstraction API : packages/api ou packages/sdk

Pour découpler définitivement le frontend (`apps/coder`) des spécificités techniques et de la structure interne des API de Coder, nous allons introduire un nouveau package partagé dans le monorepo : **`packages/api`** (ou **`packages/sdk`**).

### 5.1 Rôle de la Couche d'Abstraction
Cette couche d'abstraction agit comme une interface de médiation (un pattern "Adapter") entre le code d'interface graphique et les services de communication réels.

```
┌──────────────────────────────────────────────────────────────┐
│                  Frontend UI (apps/coder)                    │
│   - Boutons, Liste de Workspaces, Affichage de l'état        │
└──────────────────────────────┬───────────────────────────────┘
                               │ (Appels de fonctions typées)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         packages/api                         │
│            (Couche d'Abstraction & SDK Optimus)              │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │               Interface SDK Unified                  │   │
│   │   - getWorkspaces()                                  │   │
│   │   - createWorkspace()                                │   │
│   └──────────────────────────┬───────────────────────────┘   │
└──────────────────────────────┼───────────────────────────────┘
                               ▼
     ┌─────────────────────────┴─────────────────────────┐
     │                                                   │
     ▼ (Adaptateur Coder)                                ▼ (Adaptateur Services IA)
┌──────────────────────────────┐                   ┌─────────────────────────────┐
│       Coder Client API       │                   │     Optimus AI Services     │
│   (Appels REST engine Go)    │                   │   (Agents, Orchestrateur)   │
└──────────────────────────────┘                   └─────────────────────────────┘
```

### 5.2 Implémentation du SDK (`packages/api/src/index.ts`)

Le SDK encapsule l'ensemble des requêtes Axios et des abonnements WebSocket, fournissant des types de données unifiés et propres à Optimus :

```typescript
// Exemple de contrat d'interface pour les Espaces de travail
export interface OptimusWorkspace {
  id: string;
  name: string;
  owner: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  templateName: string;
  createdAt: Date;
  cpuCores: number;
  memoryGB: number;
}

// Client SDK principal
export class OptimusAPIClient {
  private axiosInstance;

  constructor(config: { baseURL: string; token?: string }) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: config.token ? { Authorization: `Bearer ${config.token}` } : {},
    });
  }

  // Abstraction de la récupération des workspaces
  async getWorkspaces(): Promise<OptimusWorkspace[]> {
    // Appel interne à l'API du moteur Coder et conversion (mapping) vers le modèle unifié d'Optimus
    const response = await this.axiosInstance.get('/api/v2/workspaces');
    return response.data.map((w: any) => this.mapToOptimusWorkspace(w));
  }

  private mapToOptimusWorkspace(coderWorkspace: any): OptimusWorkspace {
    return {
      id: coderWorkspace.id,
      name: coderWorkspace.name,
      owner: coderWorkspace.owner_username,
      status: this.mapStatus(coderWorkspace.latest_build.job.status),
      templateName: coderWorkspace.template_name,
      createdAt: new Date(coderWorkspace.created_at),
      cpuCores: coderWorkspace.resources?.cpu || 2,
      memoryGB: coderWorkspace.resources?.memory || 4,
    };
  }

  private mapStatus(coderStatus: string): OptimusWorkspace['status'] {
    switch (coderStatus) {
      case 'running': return 'running';
      case 'stopped': return 'stopped';
      case 'starting': return 'starting';
      default: return 'error';
    }
  }
}
```

### 5.3 Avantages Majeurs de cette Couche d'Abstraction
1. **Indépendance Technologique** : Si, à l'avenir, le moteur d'exécution sous-jacent est remplacé ou mis à jour de manière significative, le code de l'interface utilisateur dans `apps/coder` n'aura absolument pas besoin d'être modifié. Seul l'adaptateur au sein de `packages/api` sera mis à jour.
2. **Facilité de Tests et Simulation (Mocking)** : Le frontend peut s'exécuter de façon autonome pour des tests visuels et fonctionnels complets sans aucun moteur Go connecté, simplement en fournissant un adaptateur de simulation (Mock Adapter) renvoyant des données fictives.
3. **Consommation multi-applications** : D'autres futurs composants ou applications de l'écosystème Optimus pourront lister, démarrer ou arrêter des espaces de travail en important simplement `packages/api`.

---

## 6. Services Développeur Optimus (Optimus Developer Services)

Pour s'imposer comme une plateforme incontournable pour les équipes d'ingénierie, **Optimus Dev** propose une suite complète de **Services Développeur**. Ces fonctionnalités seront directement intégrées à l'interface d'administration de l'application et exposées via notre couche d'abstraction de données.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Console Optimus Developer                         │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │   Gestion des Clés    │  │   Documentation   │  │   Console de   │  │
│  │   (API Key Manager)   │  │    OpenAPI v3     │  │   Test d'API   │  │
│  └───────────────────────┘  └───────────────────┘  └────────────────┘  │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │ Quotas & Facturation  │  │ Logs de Requêtes  │  │  SDK Officiels │  │
│  │    (Usage billing)    │  │  (Audit Trails)   │  │  & Exemples    │  │
│  └───────────────────────┘  └───────────────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Gestion des Clés API (Création, Rotation, Révocation)
Les développeurs et les systèmes automatisés (pipelines CI/CD, outils tiers) peuvent s'authentifier de manière sécurisée auprès de la plateforme :
- **Création** : Génération de clés d'API hautement sécurisées (ex. préfixées par `opt_dev_...`) associées à des permissions fines basées sur des rôles (RBAC). Chaque clé dispose d'un nom descriptif et d'une date d'expiration optionnelle.
- **Rotation simplifiée** : Mécanisme permettant de créer une clé secondaire en parallèle d'une clé active pour assurer une transition sans aucune interruption de service dans les applications tierces, puis de désactiver l'ancienne clé.
- **Révocation instantanée** : Révocation immédiate d'une clé compromise depuis le tableau de bord développeur, invalidant toutes les sessions actives associées en moins d'une seconde.

### 6.2 Documentation Interactive & Console de Test des API
L'ensemble des services d'API exposés par le moteur d'exécution Optimus Dev est documenté de manière vivante et interactive :
- **Spécification OpenAPI (Swagger)** : Génération dynamique d'une spécification OpenAPI v3 complète à partir des définitions du backend d'Optimus Dev.
- **Documentation intégrée (Redoc / Swagger UI)** : Rendu visuel soigné et performant des endpoints au sein du portail développeur de `apps/coder`.
- **Console de test (Playground d'API)** : Un outil "Essayer l'API" ("Try it out") directement intégré permettant d'effectuer de vrais appels d'API depuis le navigateur avec les clés de test du développeur ou sa session SSO active. L'interface affiche instantanément les en-têtes HTTP, le code de statut de retour et le corps JSON de la réponse.

### 6.3 Gestion des Quotas et de la Facturation (Usage-based billing)
L'utilisation des ressources d'infrastructure (CPU, mémoire, stockage, heures de fonctionnement) et des appels d'IA est finement régulée et facturée :
- **Gestion fine des quotas** : Définition de limites de ressources strictes ou souples au niveau de l'organisation, de l'équipe ou du développeur individuel (ex. maximum 3 workspaces actifs, 8 vCPUs et 32 Go de RAM au total).
- **Facturation basée sur la consommation (Usage billing)** : Télémétrie continue mesurant la durée de fonctionnement exacte de chaque espace de travail et la quantité de tokens IA consommés. Raccordement direct via API sécurisée au module de facturation d'Optimus (basé sur **Stripe** ou un système interne) pour une facturation transparente "à la seconde".

### 6.4 Journaux des Requêtes API (Audit & Télémétrie)
La transparence est essentielle pour la sécurité des infrastructures de développement :
- **Traçabilité complète (Audit Logs)** : Enregistrement de chaque requête d'API adressée à la plateforme (qui a effectué l'appel, depuis quelle adresse IP, à quelle heure, quel endpoint a été accédé et quel a été le code de retour HTTP).
- **Console de visualisation** : Écran dédié au sein d'Optimus Dev permettant de filtrer les logs en temps réel, de rechercher par clé d'API ou par utilisateur pour diagnostiquer rapidement les anomalies ou les accès non autorisés.

### 6.5 SDK Officiels et Exemples de Code
Pour accélérer le démarrage des développeurs, nous fournissons des ressources de développement prêtes à l'emploi :
- **SDK JavaScript/TypeScript** : Version packagée, documentée et publiée de notre package `@optimus/api`.
- **SDKs multi-langages** : Génération automatisée de SDKs clients en Python et en Go à partir de notre spécification OpenAPI, simplifiant l'automatisation de l'infrastructure dans n'importe quel langage.
- **Exemples de code interactifs (Code Recipes)** : Snippets de code fonctionnels directement copiables-collables depuis la documentation (ex. "Comment créer un espace de travail en Python", "Comment démarrer un agent via cURL").

---

## 7. Intégration au Monorepo Optimus

Pour que `apps/coder` devienne une partie intégrante de la suite Optimus, elle doit consommer et partager des ressources communes.

### 7.1 Alignement des Configurations
- **`packages/config`** : Centralisation des configurations ESLint, Prettier, TypeScript, et règles de build pour uniformiser les normes de code entre la Landing page et l'application Dev.
- **`packages/utils`** : Partage d'utilitaires de formatage de données, de gestion des dates, de validation de données (Zod), et d'instances de requêtes HTTP configurées pour gérer les redirections d'API de manière transparente.

### 7.2 Partage Progressive du Design System (`packages/ui`)
Actuellement, les composants UI de Coder utilisent Material UI (MUI). Le design system d'Optimus utilise Tailwind CSS et des composants d'interface légers et rapides.
- **Étape 1 (Compatibilité temporaire)** : Garder MUI au sein de `apps/coder` pour ne pas casser l'interface utilisateur existante.
- **Étape 2 (Partage de thème)** : Injecter les couleurs et variables de marque d'Optimus dans le thème MUI afin de garantir une harmonie visuelle instantanée.
- **Étape 3 (Migration progressive)** : Remplacer un à un les composants MUI complexes par des composants partagés basés sur Tailwind, importés directement de `packages/ui` (ex. boutons, barres de navigation, modales, spinners).

---

## 8. Architecture Extensible pour les Services IA d'Optimus

Optimus a pour vocation d'intégrer des fonctionnalités d'Intelligence Artificielle de pointe (agents de codage, chat d'assistance, orchestrateur de tâches et plugins). L'architecture d'**Optimus Dev** est conçue dès le départ pour accueillir et orchestrer ces services.

### 8.1 Intégration des Composants IA dans l'Architecture

L'architecture s'articule autour d'un **Orchestrateur IA** central, communiquant avec des agents déployés au plus près du code de l'utilisateur.

```
                                  ┌────────────────────────┐
                                  │   Interface Frontend   │
                                  │     (Optimus Dev)      │
                                  └───────────┬────────────┘
                                              │ (SDK / packages/api)
                                              ▼
                                  ┌────────────────────────┐
                                  │      Optimus API       │
                                  │   Gateway / Router     │
                                  └─────┬──────────────┬───┘
                                        │              │
                   Requêtes Workspaces  │              │ Requêtes IA & Chat
                                        ▼              ▼
                            ┌──────────────┐    ┌────────────────────────┐
                            │  Coder Go    │    │     Optimus AI         │
                            │  Engine      │    │    Orchestrateur       │
                            └──────┬───────┘    └──────┬──────────┬──────┘
                                   │                   │          │
                     Tunnels Secure│                   │          │ Context / Actions
                                   ▼                   ▼          ▼
                            ┌─────────────────────────────┐    ┌─────────────────┐
                            │     Espace de Travail       │    │     Modèles     │
                            │        (Workspace)          │    │    LLM (API)    │
                            │                             │    │                 │
                            │   ┌─────────────────────┐   │    │ - OpenAI        │
                            │   │    Agent Optimus    │◄──┴────┤ - Anthropic     │
                            │   │ (Exécution locale)  │        │ - Bedrock / LLaMA│
                            │   └─────────────────────┘   │    └─────────────────┘
                            └─────────────────────────────┘
```

### 8.2 Rôle des Composants IA

1. **Optimus AI Orchestrateur (Backend)** :
   Ce service centralisé gère la file d'attente des requêtes IA, la sélection des modèles LLM (OpenAI, Anthropic, serveurs d'inférence locaux), la gestion du contexte utilisateur, et le routage des commandes. Il est totalement indépendant du moteur de provisioning de Coder, ce qui élimine les goulots d'étranglement.
2. **Agent d'Exécution IA Local** :
   Chaque espace de travail (container Docker, VM Kubernetes) exécute un daemon d'agent d'exécution. Cet agent reçoit des commandes structurées de l'Orchestrateur IA central via un canal sécurisé pour :
   - Analyser et modifier l'arborescence de fichiers du projet.
   - Lancer des compilations, exécuter des tests unitaires et capturer les logs de sortie.
   - Détecter les erreurs de code et proposer des résolutions proactives.
3. **Interface Graphique d'Interaction (Chat & Plugins)** :
   Le frontend (`apps/coder`) intègre une interface de chat rétractable et contextuelle (Sidebar Chat) similaire à un environnement de développement moderne (IDE), développée avec les composants de `@optimus/ui` et gérée par notre SDK unifié `packages/api`. Elle permet à l'utilisateur de :
   - Dialoguer avec l'IA au sujet de son espace de travail actif.
   - Demander la création de templates Terraform par simple invite de commande vocale ou textuelle.
   - Activer ou désactiver des plugins d'assistance technique par simple interrupteur (toggle).

---

## 9. Stratégie de Rebranding & White-Labeling

Pour faire d'**Optimus Dev** un produit propre, tout élément visuel ou textuel faisant référence à Coder doit être remplacé.

### 9.1 Identité Visuelle
- **Logos & Iconographie** : Remplacement de tous les fichiers SVG du logo Coder (dans le dossier `static/` ou les composants React) par le logo officiel d'Optimus (en variantes claire et sombre).
- **Thème Graphique** : Ajustement de la palette de couleurs d'Emotion/MUI pour adopter les teintes de la charte graphique d'Optimus (le dégradé sombre, les violets/bleus néon et les gris foncés visibles sur la landing page d'Optimus).
- **Favicon & Métadonnées** : Mise à jour des favicons dans `index.html` et ajustement des balises Meta pour le SEO.

### 9.2 Textes et Naming
- **Remplacement textuel** : Script automatisé combiné à des revues manuelles pour renommer "Coder", "Coder Enterprise", "Coder Host" en "Optimus Dev", "Plateforme Optimus" ou "Serveur Optimus" selon le contexte.
- **Console d'Administration & Titres** : Modification des titres de page (`document.title`), des entêtes de courriels de notification et des formulaires d'invitation.
- **Documentation et Aide** : Réécriture de la section d'aide et de la documentation utilisateur accessible depuis le menu d'aide de l'interface pour pointer vers les ressources d'Optimus.

---

## 10. Conformité avec la Licence AGPL-3.0 (Analyse Prudente)

Coder est distribué sous la licence **GNU Affero General Public License v3.0 (AGPL-3.0)**. L'AGPL-3.0 est une licence "copyleft" forte, conçue spécifiquement pour garantir que le code source des logiciels exécutés sur le réseau reste accessible aux utilisateurs finaux de ce réseau.

Il est impératif d'adopter une posture juridique rigoureuse et prudente : **le simple fait de séparer physiquement le frontend du backend ou de restructurer le monorepo ne suffit pas à éliminer de manière automatique et magique l'ensemble des obligations liées à la licence AGPL-3.0.**

### 10.1 Limites du Découplage et Risques de Contamination (Copyleft)
1. **La "Dépendance Intime" et les dérivés** :
   Si le frontend (`apps/coder`) ou notre SDK personnalisé (`packages/api`) est si étroitement lié au moteur Coder qu'il ne peut fonctionner sans lui, les tribunaux ou les audits de propriété intellectuelle pourraient considérer l'ensemble de l'application ou du SDK comme une "œuvre dérivée" de Coder. Dans ce cas, la totalité de cette œuvre (y compris nos ajouts et intégrations) pourrait être assujettie à l'obligation de divulgation sous licence AGPL-3.0.
2. **Le Déploiement SaaS et l'Interaction Réseau** :
   Tant qu'un utilisateur interagit avec une version modifiée du moteur d'origine Coder à travers un réseau, les clauses de l'AGPL-3.0 imposent de donner à cet utilisateur un accès direct au code source de la version modifiée du moteur. Le masquage ou le rebranding d'interface ne modifie pas cette obligation légale fondamentale.

### 10.2 Stratégie de Conformité Recommandée d'un Point de Vue Légal
Afin d'assurer une sécurité juridique totale pour Optimus, nous établissons les garde-fous stricts suivants :

1. **Transparence et Code Source Ouvert pour le "Core"** :
   Toutes les modifications directes apportées au moteur Coder (correctifs de bugs, intégrations de bas niveau, optimisations réseau, rebranding de l'API) seront publiées de façon transparente sur un dépôt GitHub public (par exemple, un fork d'Optimus nommé `optimus-dev-engine`). Cela écarte d'emblée toute accusation de violation de l'AGPL-3.0.
2. **Isolation Hermétique des Modules Propriétaires d'Optimus** :
   Pour s'assurer que notre logique métier exclusive d'Optimus (moteur de facturation Stripe, télémétrie commerciale, bases de données de nos clients, orchestrateurs IA propriétaires) reste 100 % fermée et protégée :
   - **Pas d'import direct de code** : Aucun module sous licence AGPL-3.0 ne doit être importé directement dans un fichier de logique commerciale propriétaire.
   - **Protocoles Standards uniquement** : La communication entre le moteur Optimus Dev et nos serveurs propriétaires s'effectuera exclusivement par l'intermédiaire de protocoles réseau standards et découplés (appels REST HTTPS ou protocoles gRPC bien délimités). Ces échanges s'apparentent à une relation "Client-Serveur" indépendante, ce qui empêche techniquement et légalement la contamination par copyleft.
3. **Audits Légaux et Techniques Continus** :
   Avant chaque mise en production majeure ou levée de fonds, un audit automatisé des licences logicielles (via des outils comme FOSSA ou Snyk) et une validation par un cabinet d'avocats spécialisé en propriété intellectuelle et logiciels libres devront être menés. Cela permettra de confirmer que l'architecture technique réelle n'introduit aucun lien de dépendance statique indésirable pouvant mettre en danger le caractère propriétaire d'autres pans d'Optimus.

---

## 11. Plan de Migration Étape par Étape (Progressif & sans Interruption)

Voici la feuille de route pas-à-pas pour mener à bien cette intégration de façon fluide, sans casser l'expérience utilisateur actuelle ni introduire de régressions.

### Étape 1 : Importation des Sources Frontend de Coder
- **Action** : Créer l'arborescence de l'application `apps/coder` en maintenant la base de code d'origine de Coder dans ce répertoire pour assurer la traçabilité technique.
- **Validation** : Raccorder l'application à `package.json` et `pnpm-workspace.yaml` au niveau de la racine. S'assurer que `pnpm install` installe correctement les dépendances et résout les types.

### Étape 2 : Configuration du Build et Intégration Turbopack / Turbo
- **Action** : Écrire un fichier `tsconfig.json` et adapter la configuration de build Vite dans `apps/coder` pour qu'elle s'intègre harmonieusement avec le pipeline Turbo du monorepo.
- **Validation** : La commande `pnpm build` lancée depuis la racine doit compiler avec succès l'application landing page (`apps/web`) et la nouvelle SPA d'administration (`apps/coder`).

### Étape 3 : Création et Raccordement du Package d'Abstraction API (`packages/api`)
- **Action** :
  - Créer l'arborescence de `packages/api` dans le monorepo.
  - Extraire et centraliser la logique de requêtage d'API au sein de ce SDK partagé sous forme d'interfaces génériques et découplées de l'implémentation de Coder.
  - Importer `@optimus/api` au sein de `apps/coder`.
- **Validation** : Vérifier que le build de `packages/api` génère correctement les définitions TypeScript (`.d.ts`) et que l'interface de `apps/coder` les consomme sans erreur de typage.

### Étape 4 : Intégration du Système SSO
- **Action** :
  - Configurer les cookies d'authentification sur le domaine partagé `.optimus.dev`.
  - Intégrer l'échange et la validation des jetons de session au démarrage de l'application dans le composant `<RequireAuth>` d'Optimus Dev.
- **Validation** : S'assurer qu'un utilisateur connecté sur `apps/web` est automatiquement reconnu par le SDK d'Optimus Dev lors de la redirection vers `apps/coder`.

### Étape 5 : Préparation de la Couche d'Extension pour l'IA d'Optimus
- **Action** :
  - Déclarer les interfaces d'API et les structures d'échange réseau dédiées aux fonctionnalités d'IA (Chat, exécution de commandes de codage) au sein de `packages/api`.
  - Intégrer la structure visuelle de la Sidebar Chat au sein de la disposition générale (`DashboardLayout`) de `apps/coder` en utilisant les composants de `@optimus/ui`.
- **Validation** : S'assurer que l'interface utilisateur s'affiche correctement, avec le composant de chat IA désactivé ou affiché en mode simulation (mock) si les services IA ne sont pas démarrés.

### Étape 6 : Rebranding Visuel & White-Labeling Complet
- **Action** :
  - Remplacer l'ensemble des logos Coder par les logos Optimus.
  - Modifier le fichier de thème Emotion (`apps/coder/src/theme/*`) pour appliquer la charte graphique d'Optimus.
  - Exécuter un script de remplacement textuel global pour substituer toutes les occurrences de "Coder" par "Optimus Dev" ou "Optimus" dans l'UI.
- **Validation** : Revue approfondie de l'ensemble des pages d'administration pour s'assurer qu'aucune mention de la marque Coder ne subsiste pour l'utilisateur final.

### Étape 7 : Implémentation des Services Développeur
- **Action** :
  - Concevoir les écrans et formulaires d'administration des clés d'API (génération, rotation, révocation).
  - Déployer l'interface Swagger UI/Redoc dans l'application pour afficher la documentation interactive des API.
  - Intégrer la console de test interactive avec liaison d'authentification pour des appels "live" sécurisés.
  - Connecter les graphiques de consommation de ressources et de quotas dans le tableau de bord utilisateur.
- **Validation** : S'assurer que l'ensemble des écrans du portail développeur se chargent sans latence et s'intègrent esthétiquement dans le design system.

### Étape 8 : Validation Légale, Télémétrie & Déploiement de Test
- **Action** :
  - Ajouter la section d'aide et les mentions de licence obligatoires de Coder et de l'AGPL-3.0 dans le footer de l'application d'administration.
  - Déployer l'interface d'Optimus Dev sur Vercel à chaque commit, et le binaire d'Optimus Dev Engine (Go) sur une infrastructure de test isolée.
  - Lancer un audit de conformité de licence automatisé (FOSSA/Snyk) pour s'assurer de l'absence de liaisons statiques interdites.
- **Validation** : Lancement d'un test d'intégration grandeur nature (création d'un espace de travail, démarrage réussi, ouverture du terminal interactif et tunnel d'un port en direct).

---

## 12. Justification et Avantages par rapport aux Alternatives

| Critère / Alternative | Intégration en Iframe | Monolithe couplé (tout-en-un) | Notre Architecture (Monorepo découplé Vercel) |
| :--- | :--- | :--- | :--- |
| **Expérience Utilisateur (UX)** | Médiocre (barres de défilement multiples, lenteur, pas d'authentification unifiée simple). | Correcte, mais temps de chargement lourds. | **Excellente** (Navigation fluide, partage de thèmes et de composants, SSO natif et transparent). |
| **Hébergement & Déploiement** | Facile mais limité. | Complexe et coûteux (nécessite d'héberger le frontend lourd sur des serveurs applicatifs coûteux). | **Optimale** (Le frontend statique ultra-rapide est servi gratuitement et instantanément par Vercel Edge). |
| **Résilience du Système** | Dépend de l'Iframe externe. | Fragile (si l'interface sature, le moteur Terraform ou WireGuard peut ralentir). | **Maximale** (Le moteur est totalement isolé et s'exécute sur des serveurs optimisés pour le calcul et le réseau). |
| **Évolutivité de l'IA** | Impossible d'intégrer l'IA dans l'Iframe de manière sécurisée. | Très complexe à intégrer au sein du serveur monolithique en Go. | **Simplifiée** (L'Orchestrateur IA d'Optimus s'intègre via la couche d'abstraction et discute directement avec les daemons agents). |
| **Services Développeurs** | Compliqués à intégrer car cloisonnés dans l'Iframe. | Lourds à gérer et surchargent le binaire Go. | **Parfaitement intégrés** (Les services développeurs, la gestion des clés, la doc interactive et la facturation sont natifs au SDK `@optimus/api`). |
| **Conformité Licence** | Floue. | Oblige à rendre l'ensemble du système public (y compris la landing page si couplée). | **Maîtrisée & Sécurisée** (Séparation claire des responsabilités, conformité AGPL-3.0 totale et isolation stricte du code commercial d'Optimus). |

---

## Conclusion et Prochaines Étapes

Cette architecture de monorepo découplée offre **le meilleur des deux mondes** : la puissance brute et la flexibilité réseau du moteur Go de Coder d'un côté, et la rapidité, la sécurité et la simplicité de déploiement de l'écosystème Vercel/React de l'autre, tout en préparant la plateforme à l'intégration future de nos fonctionnalités IA et de nos services développeurs sous une marque unique, **Optimus Dev**.

### Décisions requises pour démarrer :
1. **Validation de l'Architecture SSO, SDK et Services Développeur** : Valisez-vous la mise en place de la couche d'abstraction `packages/api` et les fonctionnalités de la console développeur ?
2. **Repository source** : Pouvez-vous nous confirmer l'accès au dépôt spécifique ou si nous devons débuter l'arborescence de `apps/coder` directement à partir du dépôt de base open-source de Coder ?
3. **Identité de marque** : Disposez-vous des éléments graphiques d'Optimus (SVG du logo, code hexadécimal des couleurs) à intégrer dans le thème ?

Une fois ces points confirmés, nous serons prêts à passer à l'**Étape 1** du plan de migration de manière totalement autonome !
