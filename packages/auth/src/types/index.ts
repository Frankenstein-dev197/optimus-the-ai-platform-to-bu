/**
 * Rôles d'utilisateurs au sein de la plateforme Optimus.
 * Un rôle définit un ensemble de droits de haut niveau sur l'ensemble de l'écosystème.
 */
export type OptimusRole = 'admin' | 'developer' | 'billing_admin' | 'guest';

/**
 * Permissions granulaires de la plateforme Optimus Dev.
 * Elles régulent finement les actions possibles sur les espaces de travail et les configurations.
 */
export type OptimusPermission =
  | 'workspace:create'
  | 'workspace:read'
  | 'workspace:update'
  | 'workspace:delete'
  | 'workspace:start'
  | 'workspace:stop'
  | 'template:create'
  | 'template:read'
  | 'template:update'
  | 'template:delete'
  | 'apikey:create'
  | 'apikey:read'
  | 'apikey:delete'
  | 'billing:read'
  | 'billing:update'
  | 'audit:read'
  | 'org:write'
  | 'org:read';

/**
 * Scopes d'API autorisés pour les clés de développeur et l'intégration externe.
 */
export type OptimusApiScope =
  | 'api:read'
  | 'api:write'
  | 'workspace:control'
  | 'ai:chat'
  | 'git:sync';

/**
 * Représentation d'un utilisateur au sein de la couche d'authentification SSO.
 */
export interface OptimusUser {
  /** Identifiant unique de l'utilisateur dans Optimus */
  readonly id: string;
  /** Nom d'utilisateur unique */
  readonly username: string;
  /** Adresse e-mail de l'utilisateur */
  readonly email: string;
  /** Nom complet */
  readonly fullName?: string;
  /** URL de la photo de profil */
  readonly avatarUrl?: string;
  /** Rôle principal de l'utilisateur */
  readonly role: OptimusRole;
  /** Date de création du compte (format ISO-8601) */
  readonly createdAt: string;
}

/**
 * Structure d'une Organisation au sein d'Optimus.
 * Une organisation est une entité logique regroupant des équipes et des quotas d'infrastructure.
 */
export interface OptimusOrganization {
  /** Identifiant unique de l'organisation */
  readonly id: string;
  /** Nom unique de l'organisation (utilisé pour les URLs) */
  readonly name: string;
  /** Nom d'affichage lisible de l'organisation */
  readonly displayName: string;
  /** Date de création de l'organisation */
  readonly createdAt: string;
}

/**
 * Structure d'une Équipe au sein d'une organisation Optimus.
 */
export interface OptimusTeam {
  /** Identifiant unique de l'équipe */
  readonly id: string;
  /** Identifiant de l'organisation parente */
  readonly orgId: string;
  /** Nom de l'équipe */
  readonly name: string;
  /** Nombre de membres au sein de l'équipe */
  readonly membersCount: number;
}
