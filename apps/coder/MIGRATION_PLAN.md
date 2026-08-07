# Plan de Migration et d'Architecture : Intégration de Optimus Dev (Optimus Dev)

Ce document présente l'analyse architecturale complète et le plan détaillé pour intégrer la plateforme de développement cloud open source **Optimus Dev** en tant que deuxième application officielle au sein du monorepo **Optimus**.

L'objectif est de faire de cette application (nom de code technique : `apps/coder`, nom public officiel : **Optimus Dev**) une extension naturelle et fluide de l'écosystème Optimus, tout en assurant un découplage total entre le moteur backend et l'interface frontend pour permettre des déploiements optimisés (Vercel pour le frontend, infrastructure dédiée pour le moteur backend).

---

## Sommaire

1. [Clarification de la Nomenclature (apps/coder vs Optimus Dev)](#1-clarification-de-la-nomenclature-appscoder-vs-optimus-dev)
2. [Analyse de l'Architecture de Optimus Dev](#2-analyse-de-larchitecture-de-coder)
3. [Stratégie de Découplage (Frontend Vercel & Backend Dédié)](#3-stratégie-de-découplage-frontend-vercel--backend-dédié)
4. [Architecture SSO Détaillée (apps/web ⟷ Optimus Dev)](#4-architecture-sso-détaillée-appsweb--optimus-dev)
5. [Couche d'Abstraction API : packages/api ou packages/sdk](#5-couche-dabstraction-api--packagesapi-ou-packagessdk)
6. [Services Développeur Optimus (Optimus Developer Services)](#6-services-développeur-optimus-optimus-developer-services)
7. [Intégration des Fournisseurs Git & Plateforme de Développement (Git Providers & Developer Platform Integration)](#7-intégration-des-fournisseurs-git--plateforme-de-développement-git-providers--developer-platform-integration)
8. [Intégration au Monorepo Optimus](#8-intégration-au-monorepo-optimus)
9. [Architecture Extensible pour les Services IA d'Optimus](#9-architecture-extensible-pour-les-services-ia-doptimus)
10. [Stratégie de Rebranding & White-Labeling](#10-stratégie-de-rebranding--white-labeling)
11. [Conformité avec la Licence AGPL-3.0 (Analyse Prudente)](#11-conformité-avec-la-licence-agpl-30-analyse-prudente)
12. [Plan de Migration Étape par Étape (Progressif & sans Interruption)](#12-plan-de-migration-étape-par-étape-progressif--sans-interruption)
13. [Justification et Avantages par rapport aux Alternatives](#13-justification-et-avantages-par-rapport-aux-alternatives)

---

## 1. Clarification de la Nomenclature (apps/coder vs Optimus Dev)

Pour éviter toute confusion tout au long du cycle de développement et de maintenance du projet, nous établissons une distinction claire entre les désignations techniques et publiques :

- **`apps/coder` (Nom Technique de Répertoire)** : C'est le nom de code physique du dossier au sein du monorepo pnpm. Conserver cette appellation dans la structure du code permet d'identifier immédiatement l'origine technologique de la base de code, de faciliter la traçabilité des imports de commits amonts (upstreams), et de maintenir une correspondance directe avec la documentation d'architecture d'origine.
- **Optimus Dev (Nom Public de Produit)** : C'est le nom de marque exclusif présenté à l'utilisateur final. Aucun client ou développeur externe ne verra de référence à "Optimus Dev" ou "apps/coder" dans l'interface de production. Toutes les interfaces graphiques, logos, documentations d'utilisation, domaines d'accès (ex. `dev.optimus.dev` ou `optimus.dev/dev`) et communications utiliseront exclusivement la marque **Optimus Dev**.

---

## 2. Analyse de l'Architecture de Optimus Dev

Pour réussir l'intégration d'une plateforme complexe comme Optimus Dev, il est essentiel d'en comprendre la structure actuelle.

### 2.1 Le Backend / Moteur (Go)
Le backend de Optimus Dev est un binaire unique et autonome écrit en **Go**. Il assure de multiples rôles critiques :
- **Serveur de API/REST & WebSocket** : Point d'entrée pour toutes les actions de configuration et d'interactivité.
- **Moteur de Provisioning (Terraform)** : Gestion du cycle de vie des espaces de travail (workspaces) sur AWS, GCP, Azure, Kubernetes, Docker, etc.
- **Coordination réseau (WireGuard®)** : Établissement de connexions de bout en bout hautement sécurisées et chiffrées entre l'utilisateur local, le serveur, et les agents s'exécutant dans les espaces de travail.
- **Serveur d'agents** : Les agents s'exécutent au sein des workspaces et communiquent en temps réel avec le serveur central pour l'exécution des commandes, le transfert de fichiers, et le tunnel de ports (Port Forwarding).
- **Service de fichiers statiques** : Par défaut, le binaire Go compile et sert directement l'interface React compilée.

### 2.2 Le Frontend / Interface (SPA React)
L'interface utilisateur de Optimus Dev est une Single Page Application (SPA) située dans le répertoire `site/` du dépôt d'origine :
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
Vercel est une plateforme conçue pour le serverless et la distribution de contenus statiques à la périphérie (Edge). Le moteur de Optimus Dev **ne peut pas** être exécuté au sein de fonctions serverless Vercel car il requiert :
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

#### A. Le Frontend (`apps/coder`) deployed on Vercel
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
4. **Génération de Session Locale Optimus Dev** :
   Une fois validé, Optimus Dev Engine génère une session utilisateur interne Optimus Dev et retourne un token JWT local ou un cookie d'API dédié à l'application `apps/coder`. L'utilisateur accède instantanément à ses espaces de travail sans aucune friction.
5. **Gestion du Logout Unifié (Single Sign-Out)** :
   Une déconnexion initiée depuis n'importe quelle application (`apps/web` ou `apps/coder`) détruira le cookie global `.optimus.dev` et enverra une requête d'invalidation (back-channel logout) à l'API Gateway d'Optimus Dev Engine pour révoquer immédiatement la session locale.

---

## 5. Couche d'Abstraction API : packages/api ou packages/sdk

Pour découpler définitivement le frontend (`apps/coder`) des spécificités techniques et de la structure interne des API de Optimus Dev, nous allons introduire un nouveau package partagé dans le monorepo : **`packages/api`** (ou **`packages/sdk`**).

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
     ▼ (Adaptateur Optimus Dev)                                ▼ (Adaptateur Services IA)
┌──────────────────────────────┐                   ┌─────────────────────────────┐
│       Optimus Dev Client API       │                   │     Optimus AI Services     │
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
    // Appel interne à l'API du moteur Optimus Dev et conversion (mapping) vers le modèle unifié d'Optimus
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

## 7. Intégration des Fournisseurs Git & Plateforme de Développement (Git Providers & Developer Platform Integration)

Pour devenir une plateforme de développement de bout en bout, **Optimus Dev** s'intègre de manière transparente avec l'écosystème Git mondial. Cette section détaille l'architecture permettant d'unifier l'authentification, les données et l'infrastructure de développement autour de Git.

### 7.1 Architecture de Connecteurs Découplés : `packages/git`
Pour éviter de coupler notre interface utilisateur ou notre logique d'affaires à un fournisseur Git spécifique, nous concevons un package de connecteurs unifié : **`packages/git`** (ou **`packages/integrations`**).

Ce package définit une interface de contrat standard (`GitProviderAdapter`) que chaque adaptateur de fournisseur doit implémenter.

```
                      ┌────────────────────────────────────────┐
                      │              packages/api              │
                      └───────────────────┬────────────────────┘
                                          │ (Appels de haut niveau)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │              packages/git              │
                      │  - Routage vers l'adaptateur actif     │
                      │  - Gestionnaire d'authentification Oauth│
                      └───────────────────┬────────────────────┘
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
       ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
       │   GitHub Adapter   │  │   GitLab Adapter   │  │   Gitea Adapter    │
       │  (GitHub Rest v3)  │  │  (GitLab REST v4)  │  │   (Gitea Client)   │
       └────────────────────┘  └────────────────────┘  └────────────────────┘
```

#### Définition du Contrat d'Adaptateur (`packages/git/src/types.ts`)
```typescript
export interface GitRepository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
  owner: string;
}

export interface GitPullRequest {
  id: string;
  number: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'closed' | 'merged';
  author: string;
  url: string;
}

export interface GitProviderAdapter {
  providerId: string; // 'github' | 'gitlab' | 'gitea' | 'bitbucket'

  // Authentification et Comptes
  getAuthUrl(redirectUri: string): string;
  exchangeCodeForToken(code: string, redirectUri: string): Promise<string>;

  // Gestion des dépôts
  listRepositories(token: string): Promise<GitRepository[]>;
  createRepository(token: string, name: string, isPrivate: boolean): Promise<GitRepository>;
  forkRepository(token: string, fullName: string): Promise<GitRepository>;

  // Management des branches et Pull Requests
  listBranches(token: string, repoFullName: string): Promise<string[]>;
  listPullRequests(token: string, repoFullName: string): Promise<GitPullRequest[]>;
  createPullRequest(token: string, repoFullName: string, title: string, head: string, base: string): Promise<GitPullRequest>;

  // Webhooks et Événements
  setupWebhook(token: string, repoFullName: string, payloadUrl: string, secret: string): Promise<void>;
}
```

#### Ajout Dynamique de Nouveaux Fournisseurs (Évolutivité Totale)
Pour ajouter un nouveau fournisseur Git dans le futur (ex. Azure DevOps ou un nouveau service Git hébergé en interne) :
1. Implémenter l'interface `GitProviderAdapter` pour ce fournisseur au sein de `packages/git`.
2. Déclarer le nouvel adaptateur dans la configuration du registre de `packages/git`.
3. **Le frontend d'Optimus Dev s'adapte automatiquement sans aucune modification** : il interroge l'API pour récupérer la liste des fournisseurs pris en charge et construit dynamiquement les boutons d'association et les menus d'import.

---

### 7.2 Authentification Multi-Fournisseurs & Synchronisation
- **OAuth Multi-Comptes** : Un utilisateur unique d'Optimus peut associer un ou plusieurs comptes de différents fournisseurs Git (ex. son compte GitHub personnel, son compte GitLab professionnel, et une instance privée Gitea).
- **Stockage Chiffré des Jetons** : Les jetons OAuth (Access Tokens et Refresh Tokens) sont chiffrés au repos (via AES-256-GCM) dans le backend d'Optimus. Ils ne sont jamais exposés au frontend et sont injectés dynamiquement lors des requêtes inter-plateformes effectuées par l'API Gateway d'Optimus.
- **Import Automatique** : Depuis son tableau de bord, l'utilisateur voit s'afficher la liste consolidée de tous ses dépôts (publics et privés) à travers tous ses fournisseurs associés. L'import d'un projet dans Optimus se fait en 1 clic.

---

### 7.3 Opérations Git Intégrées et Gestion des PR/MR
L'ensemble du cycle de développement Git peut être piloté directement depuis l'interface visuelle d'**Optimus Dev** :
- **Clonage, Fork et Création** : Les formulaires d'Optimus Dev permettent de créer un dépôt vide directement chez le fournisseur Git, de forker un projet de référence de l'entreprise, ou d'initialiser une synchronisation de branches.
- **Gestion des Pull Requests / Merge Requests** :
  - Visualisation des PR/MR actives associées au projet directement sur l'interface d'Optimus Dev.
  - Création d'une nouvelle PR/MR à la fin d'une session de codage en saisissant simplement le titre et les branches de départ et d'arrivée.
  - Raccordement aux contrôles d'accès : les actions d'écriture Git héritent des droits OAuth de l'utilisateur.

---

### 7.4 Synchronisation des Webhooks, Événements et Pipelines CI/CD
- **Abonnement aux Événements** : Lors de l'import d'un dépôt, Optimus enregistre automatiquement un Webhook chez le fournisseur Git.
- **Traitement en Temps Réel** : Les événements (ex. `push`, `pull_request_created`, `issue_comment`) sont capturés par le récepteur de webhooks d'Optimus Dev Engine pour :
  - Mettre à jour l'état de synchronisation des workspaces.
  - Déclencher des notifications aux collaborateurs via WebSocket.
  - Mettre à jour l'index de recherche de code.
- **Déclenchement CI/CD** : Optimus Dev s'interface avec les outils de CI/CD existants (GitHub Actions, GitLab CI, Jenkins). Par exemple, la réussite d'un pipeline de tests CI/CD peut automatiquement autoriser la mise en veille ou le redémarrage automatique d'un espace de travail de validation.

---

### 7.5 Lancement de Workspace en 1 Clic (Git URL Protocol)
Nous mettons en place un protocole d'infrastructure dynamique pour démarrer instantanément un environnement de développement à partir d'un dépôt Git :
- **Structure de l'URL** : `https://dev.optimus.dev/launch?repo=https://github.com/my-org/my-project&branch=feature-abc`
- **Mécanisme interne** :
  1. Optimus détecte le dépôt Git et recherche un template Terraform correspondant (ex. s'il s'agit d'un projet Node.js, il sélectionne automatiquement le template de conteneur d'environnement NodeJS de l'entreprise).
  2. L'espace de travail est provisionné en arrière-plan.
  3. Dès que le container ou la machine virtuelle démarre, l'agent exécute automatiquement un clone du dépôt et bascule sur la branche spécifiée.
  4. L'utilisateur est connecté et peut coder en moins de 30 secondes.

---

### 7.6 Synergies de Plateforme (SSO, SDK, IA et Plugins)
- **Raccordement SSO** : L'accès aux API des fournisseurs Git est conditionné par la validation du SSO Optimus. Si un utilisateur se déconnecte d'Optimus, l'accès à ses jetons Git est immédiatement suspendu.
- **SDK `packages/api`** : Expose de manière unifiée toutes les fonctions de gestion Git aux clients web, mobiles et d'administration.
- **Assistants IA d'Optimus** :
  - L'assistant IA tire profit des jetons Git de l'utilisateur pour lire le contexte des Pull Requests, suggérer des correctifs, ou rédiger automatiquement des messages de validation (commit messages).
  - Il peut générer de nouveaux fichiers directement dans l'espace de travail de l'utilisateur et pousser automatiquement les modifications après validation visuelle.
- **Système de Plugins** : Permet à des outils de développement tiers (ex. des extensions d'analyse de code, des scanners de sécurité) de s'enregistrer pour écouter les flux de webhooks Git centralisés par Optimus Dev.

---

### 7.7 Feuille de Route d'Évolution à Long Terme (Developer Portal Vision)

Pour s'affirmer comme l'outil ultime de l'ingénieur, **Optimus Dev** intégrera progressivement les fonctionnalités d'un portail développeur complet directement utilisable dans le navigateur.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Optimus Dev Portal (Long-term)                  │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │ Navigateur de Fichiers│  │  Éditeur Web      │  │ Visualiseur de │  │
│  │      Git Intégré      │  │  Léger (Monaco)   │  │   Commits/Diff │  │
│  └───────────────────────┘  └───────────────────┘  └────────────────┘  │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │   Moteur de Recherche │  │   Marketplace de  │  │   Système de   │  │
│  │     Global de Code    │  │Templates & Starters│ │    Plugins     │  │
│  └───────────────────────┘  └───────────────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Navigateur de Fichiers, Visionneur de Commits & Comparateur de Diff
- **Exploration à la volée** : Un explorateur de fichiers Git haute performance permettant de naviguer dans l'arborescence des dépôts importés sans nécessiter le démarrage complet d'un espace de travail (calcul à la demande).
- **Historique interactif** : Un graphe de commits coloré, un navigateur de branches et de tags pour visualiser les fusions et l'évolution du code.
- **Comparateur de Diff visuel** : Un moteur de comparaison côte-à-côte ou en ligne pour réviser les modifications avant de créer une Pull Request.

#### B. Éditeur de Code Léger dans le Navigateur (Web IDE)
- **Monaco Editor intégré** : Intégration de l'éditeur Monaco (le cœur de VS Code) directement dans la console d'Optimus Dev.
- **Quick-fixes & modifications rapides** : Permet d'effectuer des modifications rapides (ex. corriger un bug critique, éditer un fichier de configuration, mettre à jour la documentation) de manière instantanée, directement depuis le portail web, sans latence de démarrage de machine virtuelle.

#### C. Moteur de Recherche Global de Code
- **Indexation performante** : Mise en place d'un indexeur léger (basé sur Elasticsearch ou Zoekt) analysant les dépôts Git importés.
- **Recherche instantanée** : Possibilité de rechercher une fonction, une classe ou un mot-clé de configuration à travers toutes les organisations et tous les dépôts de l'entreprise en une fraction de seconde, avec filtrage par langage ou par auteur.

#### D. Tableau de Bord des Projets (Projects Dashboard)
- **Vue d'ensemble centralisée** : Un guichet unique affichant l'ensemble des dépôts actifs de l'équipe, leur état de build CI/CD, les Pull Requests nécessitant une revue, et les espaces de travail en cours d'exécution correspondants.

#### E. Marketplace de Templates, de Starters et Système de Plugins
- **Starters validés** : Un catalogue de templates de démarrage prêts à l'emploi (ex. "Boilerplate Next.js + Tailwind", "Microservice NestJS de production") configurés selon les standards de sécurité de l'entreprise.
- **Système de plugins extensibles** : Une API d'extension permettant aux développeurs d'ajouter des outils tiers à leur environnement de développement (ex. intégration de linters, de tableaux de bord Jira, ou d'outils d'évaluation de la performance).

---

### 7.8 Choix Techniques Recommandés, Avantages et Limites

#### Choix Techniques Recommandés
1. **Bibliothèque de manipulation Git (Backend)** : Utilisation de **go-git** (implémentation Go pure de Git) au niveau du moteur d'exécution, éliminant le besoin de dépendre du binaire système git et facilitant la conteneurisation.
2. **Éditeur de code (Frontend)** : Intégration de **@monaco-editor/react** pour l'éditeur web léger, offrant l'autocomplétion TypeScript et la coloration syntaxique prêtes à l'emploi.
3. **Moteur d'indexation de code** : Utilisation d'un service léger comme **OpenSearch** ou de fonctionnalités intégrées de recherche vectorielle (Vector Search) via notre orchestrateur IA pour combiner recherche textuelle et compréhension sémantique du code.

#### Avantages de cette Architecture
- **Découplage Absolu** : La logique Git est isolée dans `packages/git`. L'interface graphique est légère et ne gère aucune complexité réseau.
- **Expérience Développeur unifiée** : Réduction drastique de la fatigue de décision et du temps de configuration ("Onboarding") pour les nouveaux ingénieurs.
- **Économie de ressources d'infrastructure** : Les développeurs parcourent et modifient le code sans consommer de ressources de calcul (workspaces) coûteuses pour les tâches simples.

#### Limites à Anticiper et Mesures d'Atténuation
- **Limites de taux d'API des Fournisseurs (Rate Limiting)** : Les API comme celles de GitHub ont des quotas d'appels stricts.
  - *Atténuation* : Mise en place d'un cache Redis intermédiaire dans l'API Gateway d'Optimus et utilisation exclusive de webhooks pour les notifications événementielles de mise à jour au lieu d'un scrutation permanente (polling).
- **Gestion des gros dépôts (Monorepos géants)** : Le clonage ou l'indexation de dépôts de plusieurs gigaoctets peut saturer les disques du serveur ou ralentir le navigateur de fichiers.
  - *Atténuation* : Utilisation systématique du clonage partiel ou superficiel (Sparse Checkout / Shallow Clone `--depth 1`) pour l'exploration de fichiers et le calcul des diffs.

---

## 8. Intégration au Monorepo Optimus

Pour que `apps/coder` devienne une partie intégrante de la suite Optimus, elle doit consommer et partager des ressources communes.

### 8.1 Alignement des Configurations
- **`packages/config`** : Centralisation des configurations ESLint, Prettier, TypeScript, et règles de build pour uniformiser les normes de code entre la Landing page et l'application Dev.
- **`packages/utils`** : Partage d'utilitaires de formatage de données, de gestion des dates, de validation de données (Zod), et d'instances de requêtes HTTP configurées pour gérer les redirections d'API de manière transparente.

### 8.2 Partage Progressif du Design System (`packages/ui`)
Actuellement, les composants UI de Optimus Dev utilisent Material UI (MUI). Le design system d'Optimus utilise Tailwind CSS et des composants d'interface légers et rapides.
- **Étape 1 (Compatibilité temporaire)** : Garder MUI au sein de `apps/coder` pour ne pas casser l'interface utilisateur existante.
- **Étape 2 (Partage de thème)** : Injecter les couleurs et variables de marque d'Optimus dans le thème MUI afin de garantir une harmonie visuelle instantanée.
- **Étape 3 (Migration progressive)** : Remplacer un à un les composants MUI complexes par des composants partagés basés sur Tailwind, importés directement de `packages/ui` (ex. boutons, barres de navigation, modales, spinners).

---

## 9. Architecture Extensible pour les Services IA d'Optimus

Optimus a pour vocation d'intégrer des fonctionnalités d'Intelligence Artificielle de pointe (agents de codage, chat d'assistance, orchestrateur de tâches et plugins). L'architecture d'**Optimus Dev** est conçue dès le départ pour accueillir et orchestrer ces services.

### 9.1 Intégration des Composants IA dans l'Architecture

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
                            │  Optimus Dev Go    │    │     Optimus AI         │
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

### 9.2 Rôle des Composants IA

1. **Optimus AI Orchestrateur (Backend)** :
   Ce service centralisé gère la file d'attente des requêtes IA, la sélection des modèles LLM (OpenAI, Anthropic, serveurs d'inférence locaux), la gestion du contexte utilisateur, et le routage des commandes. Il est totalement indépendant du moteur de provisioning de Optimus Dev, ce qui élimine les goulots d'étranglement.
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

## 10. Stratégie de Rebranding & White-Labeling

Pour faire d'**Optimus Dev** un produit propre, tout élément visuel ou textuel faisant référence à Optimus Dev doit être remplacé.

### 10.1 Identité Visuelle
- **Logos & Iconographie** : Remplacement de tous les fichiers SVG du logo Optimus Dev (dans le dossier `static/` ou les composants React) par le logo officiel d'Optimus (en variantes claire et sombre).
- **Thème Graphique** : Ajustement de la palette de couleurs d'Emotion/MUI pour adopter les teintes de la charte graphique d'Optimus (le dégradé sombre, les violets/bleus néon et les gris foncés visibles sur la landing page d'Optimus).
- **Favicon & Métadonnées** : Mise à jour des favicons dans `index.html` et ajustement des balises Meta pour le SEO.

### 10.2 Textes et Naming
- **Remplacement textuel** : Script automatisé combiné à des revues manuelles pour renommer "Optimus Dev", "Optimus Dev Enterprise", "Optimus Dev Host" en "Optimus Dev", "Plateforme Optimus" ou "Serveur Optimus" selon le contexte.
- **Console d'Administration & Titres** : Modification des titres de page (`document.title`), des entêtes de courriels de notification et des formulaires d'invitation.
- **Documentation et Aide** : Réécriture de la section d'aide et de la documentation utilisateur accessible depuis le menu d'aide de l'interface pour pointer vers les ressources d'Optimus.

---

## 11. Conformité avec la Licence AGPL-3.0 (Analyse Prudente)

Optimus Dev est distribué sous la licence **GNU Affero General Public License v3.0 (AGPL-3.0)**. L'AGPL-3.0 is une licence "copyleft" forte, conçue spécifiquement pour garantir que le code source des logiciels exécutés sur le réseau reste accessible aux utilisateurs finaux de ce réseau.

Il est impératif d'adopter une posture juridique rigoureuse et prudente : **le simple fait de séparer physiquement le frontend du backend ou de restructurer le monorepo ne suffit pas à éliminer de manière automatique et magique l'ensemble des obligations liées à la licence AGPL-3.0.**

### 11.1 Limites du Découplage et Risques de Contamination (Copyleft)
1. **La "Dépendance Intime" et les dérivés** :
   Si le frontend (`apps/coder`) ou notre SDK personnalisé (`packages/api`) est si étroitement lié au moteur Optimus Dev qu'il ne peut fonctionner sans lui, les tribunaux ou les audits de propriété intellectuelle pourraient considérer l'ensemble de l'application ou du SDK comme une "œuvre dérivée" de Optimus Dev. Dans ce cas, la totalité de cette œuvre (y compris nos ajouts et intégrations) pourrait être assujettie à l'obligation de divulgation sous licence AGPL-3.0.
2. **Le Déploiement SaaS et l'Interaction Réseau** :
   Tant qu'un utilisateur interagit avec une version modifiée du moteur d'origine Optimus Dev à travers un réseau, les clauses de l'AGPL-3.0 imposent de donner à cet utilisateur un accès direct au code source de la version modifiée du moteur. Le masquage ou le rebranding d'interface ne modifie pas cette obligation légale fondamentale.

### 11.2 Stratégie de Conformité Recommandée d'un Point de Vue Légal
Afin d'assurer une sécurité juridique totale pour Optimus, nous établissons les garde-fous stricts suivants :

1. **Transparence et Code Source Ouvert pour le "Core"** :
   Toutes les modifications directes apportées au moteur Optimus Dev (correctifs de bugs, intégrations de bas niveau, optimisations réseau, rebranding de l'API) seront publiées de façon transparente sur un dépôt GitHub public (par exemple, un fork d'Optimus nommé `optimus-dev-engine`). Cela écarte d'emblée toute accusation de violation de l'AGPL-3.0.
2. **Isolation Hermétique des Modules Propriétaires d'Optimus** :
   Pour s'assurer que notre logique métier exclusive d'Optimus (moteur de facturation Stripe, télémétrie commerciale, bases de données de nos clients, orchestrateurs IA propriétaires) reste 100 % fermée et protégée :
   - **Pas d'import direct de code** : Aucun module sous licence AGPL-3.0 ne doit être importé directement dans un fichier de logique commerciale propriétaire.
   - **Protocoles Standards uniquement** : La communication entre le moteur Optimus Dev et nos serveurs propriétaires s'effectuera exclusivement par l'intermédiaire de protocoles réseau standards et découplés (appels REST HTTPS ou protocoles gRPC bien délimités). Ces échanges s'apparentent à une relation "Client-Serveur" indépendante, ce qui empêche techniquement et légalement la contamination par copyleft.
3. **Audits Légaux et Techniques Continus** :
   Avant chaque mise en production majeure ou levée de fonds, un audit automatisé des licences logicielles (via des outils comme FOSSA ou Snyk) et une validation par un cabinet d'avocats spécialisé en propriété intellectuelle et logiciels libres devront être menés. Cela permettra de confirmer que l'architecture technique réelle n'introduit aucun lien de dépendance statique indésirable pouvant mettre en danger le caractère propriétaire d'autres pans d'Optimus.

---

## 12. Plan de Migration Étape par Étape (Progressif & sans Interruption)

Voici la feuille de route pas-à-pas pour mener à bien cette intégration de façon fluide, sans casser l'expérience utilisateur actuelle ni introduire de régressions.

### Étape 1 : Importation des Sources Frontend de Optimus Dev
- **Action** : Créer l'arborescence de l'application `apps/coder` en maintenant la base de code d'origine de Optimus Dev dans ce répertoire pour assurer la traçabilité technique.
- **Validation** : Raccorder l'application à `package.json` et `pnpm-workspace.yaml` au niveau de la racine. S'assurer que `pnpm install` installe correctement les dépendances et résout les types.

### Étape 2 : Configuration du Build et Intégration Turbopack / Turbo
- **Action** : Écrire un fichier `tsconfig.json` et adapter la configuration de build Vite dans `apps/coder` pour qu'elle s'intègre harmonieusement avec le pipeline Turbo du monorepo.
- **Validation** : La commande `pnpm build` lancée depuis la racine doit compiler avec succès l'application landing page (`apps/web`) et la nouvelle SPA d'administration (`apps/coder`).

### Étape 3 : Création et Raccordement du Package d'Abstraction API (`packages/api`)
- **Action** :
  - Créer l'arborescence de `packages/api` dans le monorepo.
  - Extraire et centraliser la logique de requêtage d'API au sein de ce SDK partagé sous forme d'interfaces génériques et découplées de l'implémentation de Optimus Dev.
  - Importer `@optimus/api` au sein de `apps/coder`.
- **Validation** : Vérifier que le build de `packages/api` génère correctement les définitions TypeScript (`.d.ts`) et que l'interface de `apps/coder` les consomme sans erreur de typage.

### Étape 4 : Création du Connecteur Git Partagé (`packages/git`)
- **Action** :
  - Déclarer la structure de `packages/git`.
  - Implémenter l'interface générique `GitProviderAdapter` et déployer l'adaptateur GitHub de référence.
  - Raccorder `@optimus/git` à `@optimus/api` pour exposer la récupération des dépôts et la création de webhooks.
- **Validation** : Compiler avec succès le package de connecteurs et exécuter des tests unitaires de simulation de requêtage Git.

### Étape 5 : Intégration du Système SSO
- **Action** :
  - Configurer les cookies d'authentification sur le domaine partagé `.optimus.dev`.
  - Intégrer l'échange et la validation des jetons de session au démarrage de l'application dans le composant `<RequireAuth>` d'Optimus Dev.
- **Validation** : S'assurer qu'un utilisateur connecté sur `apps/web` est automatiquement reconnu par le SDK d'Optimus Dev lors de la redirection vers `apps/coder`.

### Étape 6 : Préparation de la Couche d'Extension pour l'IA d'Optimus
- **Action** :
  - Déclarer les interfaces d'API et les structures d'échange réseau dédiées aux fonctionnalités d'IA (Chat, exécution de commandes de codage) au sein de `packages/api`.
  - Intégrer la structure visuelle de la Sidebar Chat au sein de la disposition générale (`DashboardLayout`) de `apps/coder` en utilisant les composants de `@optimus/ui`.
- **Validation** : S'assurer que l'interface utilisateur s'affiche correctement, avec le composant de chat IA désactivé ou affiché en mode simulation (mock) si les services IA ne sont pas démarrés.

### Étape 7 : Rebranding Visuel & White-Labeling Complet
- **Action** :
  - Remplacer l'ensemble des logos Optimus Dev par les logos Optimus.
  - Modifier le fichier de thème Emotion (`apps/coder/src/theme/*`) pour appliquer la charte graphique d'Optimus.
  - Exécuter un script de remplacement textuel global pour substituer toutes les occurrences de "Optimus Dev" par "Optimus Dev" ou "Optimus" dans l'UI.
- **Validation** : Revue approfondie de l'ensemble des pages d'administration pour s'assurer qu'aucune mention de la marque Optimus Dev ne subsiste pour l'utilisateur final.

### Étape 8 : Implémentation des Services Développeur
- **Action** :
  - Concevoir les écrans et formulaires d'administration des clés d'API (génération, rotation, révocation).
  - Déployer l'interface Swagger UI/Redoc dans l'application pour afficher la documentation interactive des API.
  - Intégrer la console de test interactive avec liaison d'authentification pour des appels "live" sécurisés.
  - Connecter les graphiques de consommation de ressources et de quotas dans le tableau de bord utilisateur.
- **Validation** : S'assurer que l'ensemble des écrans du portail développeur se chargent sans latence et s'intègrent esthétiquement dans le design system.

### Étape 9 : Validation Légale, Télémétrie & Déploiement de Test
- **Action** :
  - Ajouter la section d'aide et les mentions de licence obligatoires de Optimus Dev et de l'AGPL-3.0 dans le footer de l'application d'administration.
  - Déployer l'interface d'Optimus Dev sur Vercel à chaque commit, et le binaire d'Optimus Dev Engine (Go) sur une infrastructure de test isolée.
  - Lancer un audit de conformité de licence automatisé (FOSSA/Snyk) pour s'assurer de l'absence de liaisons statiques interdites.
- **Validation** : Lancement d'un test d'intégration grandeur nature (création d'un espace de travail, démarrage réussi, ouverture du terminal interactif et tunnel d'un port en direct).

---

## 13. Justification et Avantages par rapport aux Alternatives

| Critère / Alternative | Intégration en Iframe | Monolithe couplé (tout-en-un) | Notre Architecture (Monorepo découplé Vercel) |
| :--- | :--- | :--- | :--- |
| **Expérience Utilisateur (UX)** | Médiocre (barres de défilement multiples, lenteur, pas d'authentification unifiée simple). | Correcte, mais temps de chargement lourds. | **Excellente** (Navigation fluide, partage de thèmes et de composants, SSO natif et transparent). |
| **Hébergement & Déploiement** | Facile mais limité. | Complexe et coûteux (nécessite d'héberger le frontend lourd sur des serveurs applicatifs coûteux). | **Optimale** (Le frontend statique ultra-rapide est servi gratuitement et instantanément par Vercel Edge). |
| **Résilience du Système** | Dépend de l'Iframe externe. | Fragile (si l'interface sature, le moteur Terraform ou WireGuard peut ralentir). | **Maximale** (Le moteur est totalement isolé et s'exécute sur des serveurs optimisés pour le calcul et le réseau). |
| **Évolutivité de l'IA** | Impossible d'intégrer l'IA dans l'Iframe de manière sécurisée. | Très complexe à intégrer au sein du serveur monolithique en Go. | **Simplifiée** (L'Orchestrateur IA d'Optimus s'intègre via la couche d'abstraction et discute directement avec les daemons agents). |
| **Intégrations Git** | Closes et limitées aux fonctionnalités d'Iframe d'origine. | Difficiles à modifier car soudées au moteur principal. | **Totale & Extensible** (Structure d'adaptateurs découplée et partagée via le SDK `packages/api`). |
| **Services Développeurs** | Compliqués à intégrer car cloisonnés dans l'Iframe. | Lourds à gérer et surchargent le binaire Go. | **Parfaitement intégrés** (Les services développeurs, la gestion des clés, la doc interactive et la facturation sont natifs au SDK `@optimus/api`). |
| **Conformité Licence** | Floue. | Oblige à rendre l'ensemble du système public (y compris la landing page si couplée). | **Maîtrisée & Sécurisée** (Séparation claire des responsabilités, conformité AGPL-3.0 totale et isolation stricte du code commercial d'Optimus). |

---

## Conclusion et Prochaines Étapes

Cette architecture de monorepo découplée offre **le meilleur des deux mondes** : la puissance brute et la flexibilité réseau du moteur Go de Optimus Dev d'un côté, et la rapidité, la sécurité et la simplicité de déploiement de l'écosystème Vercel/React de l'autre, tout en préparant la plateforme à l'intégration future de nos fonctionnalités d'IA, de nos intégrations Git multi-plateformes, et de nos services développeurs sous une marque unique, **Optimus Dev**.

### Décisions requises pour démarrer :
1. **Validation de la Nouvelle Section Git** : Validez-vous la conception du package de connecteurs `packages/git` et l'architecture d'intégration de plateformes Git (GitHub, GitLab, Gitea) ?
2. **Repository source** : Pouvez-vous nous confirmer l'accès au dépôt spécifique ou si nous devons débuter l'arborescence de `apps/coder` directement à partir du dépôt de base open-source de Optimus Dev ?
3. **Identité de marque** : Disposez-vous des éléments graphiques d'Optimus (SVG du logo, code hexadécimal des couleurs) à intégrer dans le thème ?

Une fois ces points confirmés, nous serons prêts à passer à l'**Étape 1** du plan de migration de manière totalement autonome !
