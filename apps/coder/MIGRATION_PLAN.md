# Plan de Migration et d'Architecture : Intégration de Coder (Optimus Dev)

Ce document présente l'analyse architecturale complète et le plan détaillé pour intégrer la plateforme de développement cloud open source **Coder** en tant que deuxième application officielle au sein du monorepo **Optimus**.

L'objectif est de faire de cette application (nom de code interne : `apps/coder`, nom public : **Optimus Dev**) une extension naturelle et fluide de l'écosystème Optimus, tout en assurant un découplage total entre le moteur backend et l'interface frontend pour permettre des déploiements optimisés (Vercel pour le frontend, infrastructure dédiée pour le moteur backend).

---

## Sommaire

1. [Analyse de l'Architecture de Coder](#1-analyse-de-larchitecture-de-coder)
2. [Stratégie de Découplage (Frontend Vercel & Backend Dédié)](#2-stratégie-de-découplage-frontend-vercel--backend-dédié)
3. [Intégration au Monorepo Optimus](#3-intégration-au-monorepo-optimus)
4. [Stratégie de Rebranding & White-Labeling (de Coder vers Optimus)](#4-stratégie-de-rebranding--white-labeling-de-coder-vers-optimus)
5. [Conformité avec la Licence AGPL-3.0](#5-conformité-avec-la-licence-agpl-30)
6. [Plan de Migration Étape par Étape (Progressif & sans Interruption)](#6-plan-de-migration-étape-par-étape-progressif--sans-interruption)
7. [Justification et Avantages par rapport aux Alternatives](#7-justification-et-avantages-par-rapport-aux-alternatives)

---

## 1. Analyse de l'Architecture de Coder

Pour réussir l'intégration d'une plateforme complexe comme Coder, il est essentiel d'en comprendre la structure actuelle.

### 1.1 Le Backend / Moteur (Go)
Le backend de Coder est un binaire unique et autonome écrit en **Go**. Il assure de multiples rôles critiques :
- **Serveur de API/REST & WebSocket** : Point d'entrée pour toutes les actions de configuration et d'interactivité.
- **Moteur de Provisioning (Terraform)** : Gestion du cycle de vie des espaces de travail (workspaces) sur AWS, GCP, Azure, Kubernetes, Docker, etc.
- **Coordination réseau (WireGuard®)** : Établissement de connexions de bout en bout hautement sécurisées et chiffrées entre l'utilisateur local, le serveur, et les agents s'exécutant dans les espaces de travail.
- **Serveur d'agents** : Les agents s'exécutent au sein des workspaces et communiquent en temps réel avec le serveur central pour l'exécution des commandes, le transfert de fichiers, et le tunnel de ports (Port Forwarding).
- **Service de fichiers statiques** : Par défaut, le binaire Go compile et sert directement l'interface React compilée.

### 1.2 Le Frontend / Interface (SPA React)
L'interface utilisateur de Coder est une Single Page Application (SPA) située dans le répertoire `site/` du dépôt d'origine :
- **Framework** : React avec TypeScript.
- **Gestionnaire de build** : Vite (anciennement Create React App).
- **Styles & UI** : Material UI v5 (MUI) associé à Emotion CSS.
- **Routing** : `react-router` v6 (avec gestion des routes privées `<RequireAuth>` et de la structure du tableau de bord `<DashboardLayout>`).
- **Gestion d'état & Requêtes** : TanStack Query (React Query) v4 pour la synchronisation du cache serveur et Axios pour les appels HTTP.
- **Formulaires** : Formik complété par Yup pour les validations de schéma.
- **Tests** : Playwright pour l'E2E, Vitest pour les tests unitaires, et Storybook pour les tests visuels.

---

## 2. Stratégie de Découplage (Frontend Vercel & Backend Dédié)

### 2.1 Le Problème du Découplage sur Vercel
Vercel est une plateforme conçue pour le serverless et la distribution de contenus statiques à la périphérie (Edge). Le moteur de Coder **ne peut pas** être exécuté au sein de fonctions serverless Vercel car il requiert :
1. Des connexions réseau TCP/UDP persistantes à long terme (tunnels WireGuard).
2. L'exécution de processus d'arrière-plan durables (moteur Terraform, agents en écoute).
3. Des connexions WebSocket hautement interactives et persistantes (terminaux Web intégrés, SSH sur navigateur).

### 2.2 L'Architecture Cible Proposée

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
                  │      (Next.js /        │    │      (Backend Go)      │
                  │   Vite Single Page)    │    │                        │
                  │                        │    │  - Terraform Runner    │
                  │   - @optimus/ui        │    │  - WireGuard Tunnels   │
                  │   - @optimus/utils     │    │  - Workspace Agents    │
                  └────────────────────────┘    └────────────────────────┘
```

#### A. Le Frontend (`apps/coder`) déployé sur Vercel
L'interface sera isolée sous forme d'application autonome. Elle sera compilée de manière statique (SSG) ou gérée sous forme de SPA hébergée sur Vercel.
Toutes ses requêtes réseau seront redirigées vers le moteur backend.

#### B. Le Moteur (`Optimus Engine` - Backend Go) déployé indépendamment
Le moteur d'exécution Go sera hébergé sur une infrastructure dédiée et pérenne (par exemple, un cluster Kubernetes, des instances AWS EC2, ou des serveurs Linux sécurisés). Cela garantit la stabilité de Terraform et des connexions WireGuard.

#### C. Gestion de la Communication : HTTP, CORS et WebSockets
1. **Reverse Proxy & Redirections (Recommandé)** :
   Pour éviter les tracas liés au CORS (Cross-Origin Resource Sharing) et simplifier l'authentification basée sur les cookies de session (`HttpOnly`, `SameSite=Lax`, `Secure`), nous utiliserons la fonction **Vercel Rewrites** (définie dans `vercel.json` ou `next.config.mjs`).
   Toute requête vers `https://dev.optimus.dev/api/*` sera redirigée de manière transparente à la périphérie de Vercel vers le moteur backend Go exécuté sur `https://engine.optimus.dev/api/*`.
2. **WebSocket Bypass** :
   Les connexions WebSocket durables (ex. `/api/v2/workspaceagents/{id}/pty`) de Vercel peuvent être limitées par les timeouts serverless.
   **Solution** : Dans le code du frontend, nous configurerons l'URL d'établissement des WebSockets pour qu'elle pointe **directement** vers le domaine d'exécution du moteur Go (ex. `wss://engine.optimus.dev/...`). Cela permet de contourner les limites de Vercel pour les sessions de terminal interactif.
3. **Authentification Intégrée** :
   La plateforme utilisera l'authentification unifiée d'Optimus. Lors de la connexion sur la landing page (`apps/web`), un jeton sécurisé ou un cookie partagé sera utilisé pour accorder automatiquement l'accès à la page de développement (`apps/coder`).

---

## 3. Intégration au Monorepo Optimus

Pour que `apps/coder` devienne une partie intégrante de la suite Optimus, elle doit consommer et partager des ressources communes.

```
                            ┌─────────────────────┐
                            │      Monorepo       │
                            └──────────┬──────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     ┌─────────────────────┐                       ┌─────────────────────┐
     │     apps/web        │                       │     apps/coder      │
     │  (Landing Optimus)  │                       │    (Optimus Dev)    │
     └──────────┬──────────┘                       └──────────┬──────────┘
                │                                             │
                └───────────────┐             ┌───────────────┘
                                ▼             ▼
                        ┌─────────────────────────────┐
                        │      packages/ui            │
                        │   (Boutons, Cards, Thème)   │
                        └─────────────────────────────┘
                        ┌─────────────────────────────┐
                        │      packages/utils         │
                        │   (Formatage, Client API)   │
                        └─────────────────────────────┘
                        ┌─────────────────────────────┐
                        │      packages/config        │
                        │    (ESLint, TSConfig)       │
                        └─────────────────────────────┘
```

### 3.1 Migration vers `@optimus/ui`
Actuellement, les composants UI de Coder utilisent Material UI (MUI). Le design system d'Optimus utilise Tailwind CSS et des composants d'interface légers et rapides.
- **Étape 1 (Compatibilité temporaire)** : Garder MUI au sein de `apps/coder` pour ne pas casser l'interface utilisateur existante.
- **Étape 2 (Partage de thème)** : Injecter les couleurs et variables de marque d'Optimus dans le thème MUI afin de garantir une harmonie visuelle instantanée.
- **Étape 3 (Migration progressive)** : Remplacer un à un les composants MUI complexes par des composants partagés basés sur Tailwind, importés directement de `packages/ui` (ex. boutons, barres de navigation, modales, spinners).

### 3.2 Partage avec `@optimus/utils` et `@optimus/config`
- **`packages/config`** : Centralisation des configurations ESLint, Prettier, TypeScript, et règles de build pour uniformiser les normes de code entre la Landing page et l'application Dev.
- **`packages/utils`** : Partage d'utilitaires de formatage de données, de gestion des dates, de validation de données (Zod), et d'instances de requêtes HTTP configurées pour gérer les redirections d'API de manière transparente.

---

## 4. Stratégie de Rebranding & White-Labeling (de Coder vers Optimus)

Pour faire d'**Optimus Dev** un produit propre, tout élément visuel ou textuel faisant référence à Coder doit être remplacé.

### 4.1 Identité Visuelle
- **Logos & Iconographie** : Remplacement de tous les fichiers SVG du logo Coder (dans le dossier `static/` ou les composants React) par le logo officiel d'Optimus (en variantes claire et sombre).
- **Thème Graphique** : Ajustement de la palette de couleurs d'Emotion/MUI pour adopter les teintes de la charte graphique d'Optimus (le dégradé sombre, les violets/bleus néon et les gris foncés visibles sur la landing page d'Optimus).
- **Favicon & Métadonnées** : Mise à jour des favicons dans `index.html` et ajustement des balises Meta pour le SEO.

### 4.2 Textes et Naming
- **Remplacement textuel** : Script automatisé combiné à des revues manuelles pour renommer "Coder", "Coder Enterprise", "Coder Host" en "Optimus Dev", "Plateforme Optimus" ou "Serveur Optimus" selon le contexte.
- **Console d'Administration & Titres** : Modification des titres de page (`document.title`), des entêtes de courriels de notification et des formulaires d'invitation.
- **Documentation et Aide** : Réécriture de la section d'aide et de la documentation utilisateur accessible depuis le menu d'aide de l'interface pour pointer vers les ressources d'Optimus.

---

## 5. Conformité avec la Licence AGPL-3.0

Coder est un projet publié sous licence **GNU Affero General Public License v3.0 (AGPL-3.0)**. Le respect de cette licence est crucial pour garantir la légitimité juridique d'Optimus.

### 5.1 Les Obligations de la licence AGPL-3.0
1. **Divulgation du Code Source modifié** : Si nous modifions le code de Coder (backend ou frontend) et que nous le rendons accessible à des utilisateurs via le réseau (SaaS), nous devons mettre à disposition des utilisateurs le code source complet de ces modifications sous la même licence AGPL-3.0.
2. **Conservation des Avis de Droit d'Auteur** : Tous les en-têtes de fichiers originaux et les mentions de copyright ("Copyright (C) Coder Technologies...") doivent être préservés dans les fichiers sources existants.
3. **White-labeling et Licence** : Le rebranding visuel est parfaitement autorisé par la licence, à condition que la mention de la licence d'origine reste accessible (par exemple dans une section "À propos" ou via un lien "Licences open-source" dans le pied de page de la console d'administration).

### 5.2 Notre Stratégie de Conformité et d'Isolement
Pour allier flexibilité commerciale et respect de l'open source :
1. **Publication du Fork Rebrandé** : Optimus publiera de façon ouverte les modifications apportées aux modules Coder (par exemple, via un dépôt GitHub public "Optimus Dev" contenant le code rebrandé).
2. **Découplage de la Logique Propriétaire d'Optimus** :
   - Tout service ou composant propriétaire spécifique à Optimus (par exemple, notre propre système de facturation, d'analyse commerciale, ou de gestion de comptes premium) sera placé dans des packages distincts (`packages/billing`, `packages/telemetry`) ou géré via une architecture de microservices externes.
   - De cette façon, ces services propriétaires restent en dehors du périmètre de l'AGPL-3.0 (ils ne "contaminent" pas la logique métier exclusive d'Optimus, car ils communiquent via des APIs HTTP standards et sont isolés du code dérivé de Coder).

---

## 6. Plan de Migration Étape par Étape (Progressif & sans Interruption)

Voici la feuille de route pas-à-pas pour mener à bien cette intégration de façon fluide, sans casser l'expérience utilisateur actuelle ni introduire de régressions.

### Étape 1 : Importation des Sources Frontend de Coder
- **Action** : Créer l'arborescence de l'application `apps/coder` en important la base de code du dossier `site/` de Coder (sans le backend Go pour l'instant).
- **Validation** : Raccorder l'application à `package.json` et `pnpm-workspace.yaml` au niveau de la racine. S'assurer que `pnpm install` installe correctement les dépendances et résout les types.

### Étape 2 : Configuration du Build et Intégration Turbopack / Turbo
- **Action** : Écrire un fichier `tsconfig.json` et adapter la configuration de build Vite dans `apps/coder` pour qu'elle s'intègre harmonieusement avec le pipeline Turbo du monorepo.
- **Validation** : La commande `pnpm build` lancée depuis la racine doit compiler avec succès l'application landing page (`apps/web`) et la nouvelle SPA d'administration (`apps/coder`).

### Étape 3 : Mise en place de la Stratégie de Proxying (Découplage API/WS)
- **Action** :
  - Configurer `vercel.json` pour la redirection `/api/*` et `/swagger/*` de `apps/coder` vers l'adresse d'un serveur d'évaluation backend Coder de test.
  - Modifier le client d'API (Axios) et le module de gestion des WebSockets pour lire dynamiquement les variables d'environnement (`NEXT_PUBLIC_ENGINE_URL` ou `CODER_HOST`).
- **Validation** : Lancer l'interface utilisateur locale pointant vers une instance backend réelle et valider que l'authentification et l'affichage des workspaces s'effectuent sans erreur CORS.

### Étape 4 : Rebranding Visuel & White-Labeling Complet
- **Action** :
  - Remplacer l'ensemble des logos Coder par les logos Optimus.
  - Modifier le fichier de thème Emotion (`apps/coder/src/theme/*`) pour appliquer la charte graphique d'Optimus.
  - Exécuter un script de remplacement textuel global pour substituer "Coder" par "Optimus Dev" / "Optimus" dans l'UI.
- **Validation** : Revue approfondie de l'ensemble des pages d'administration pour s'assurer qu'aucune mention de la marque Coder ne subsiste pour l'utilisateur final.

### Étape 5 : Raccordement aux Packages Partagés du Monorepo
- **Action** :
  - Importer `@optimus/ui`, `@optimus/config`, et `@optimus/utils` dans les dépendances de `apps/coder`.
  - Commencer à remplacer des utilitaires internes de formatage ou des hooks redondants par ceux partagés dans `packages/utils`.
- **Validation** : Les modifications de code doivent compiler parfaitement et les tests unitaires existants de Coder (Vitest) doivent passer.

### Étape 6 : Validation de la Licence & Déploiement de Test
- **Action** :
  - Ajouter les crédits open source obligatoires et la notice de licence AGPL-3.0 dans le footer de l'application.
  - Établir le pipeline de déploiement CI/CD automatique : déploiement du frontend de `apps/coder` sur Vercel à chaque commit, et déploiement parallèle du binaire de l'Optimus Engine sur une instance de calcul isolée.
- **Validation** : Lancement d'un test d'intégration grandeur nature (création d'un espace de travail, démarrage d'un container Docker de test via Terraform, connexion réussie au terminal en ligne).

---

## 7. Justification et Avantages par rapport aux Alternatives

| Critère / Alternative | Intégration en Iframe | Monolithe couplé (tout-en-un) | Notre Architecture (Monorepo découplé Vercel) |
| :--- | :--- | :--- | :--- |
| **Expérience Utilisateur (UX)** | Médiocre (barres de défilement multiples, lenteur, pas d'authentification unifiée simple). | Correcte, mais temps de chargement lourds. | **Excellente** (Navigation fluide, partage de thèmes et de composants, SSO natif). |
| **Facilité de Déploiement** | Facile mais limité. | Complexe et coûteux (nécessite d'héberger le frontend lourd sur des serveurs applicatifs coûteux). | **Optimale** (Le frontend statique ultra-rapide est servi gratuitement et instantanément par Vercel Edge). |
| **Robustesse du Moteur** | Dépend de l'Iframe externe. | Fragile (si l'interface sature, le moteur Terraform ou WireGuard peut ralentir). | **Maximale** (Le moteur est totalement isolé et s'exécute sur des serveurs optimisés pour le calcul et le réseau). |
| **Évolutivité & Maintenance** | Très difficile de modifier le code de l'Iframe. | Complexe à mettre à jour car tout est imbriqué dans le binaire Go. | **Simplifiée** (Les équipes frontend travaillent sur Vercel avec des outils familiers ; les équipes infra font évoluer le moteur indépendamment). |
| **Conformité Licence** | Floue. | Oblige à rendre l'ensemble du système public (y compris la landing page si couplée). | **Maîtrisée** (Séparation claire des responsabilités, conformité AGPL-3.0 totale et isolation du code commercial d'Optimus). |

---

## Conclusion et Prochaines Étapes

Cette architecture de monorepo découplée offre **le meilleur des deux mondes** : la puissance brute et la flexibilité réseau du moteur Go de Coder d'un côté, et la rapidité, la sécurité et la simplicité de déploiement de l'écosystème Vercel/React de l'autre.

### Décisions requises pour démarrer :
1. **Validation du plan** : Validez-vous la stratégie de redirection API / WebSocket directe pour Vercel ?
2. **Repository source** : Pouvez-vous nous confirmer l'accès au dépôt spécifique ou si nous devons débuter l'arborescence de `apps/coder` directement à partir du dépôt de base open-source de Coder ?
3. **Identité de marque** : Disposez-vous des éléments graphiques d'Optimus (SVG du logo, code hexadécimal des couleurs) à intégrer dans le thème ?

Une fois ces points confirmés, nous pourrons passer à l'**Étape 1** du plan de migration de manière totalement autonome !
