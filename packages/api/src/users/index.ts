import { OptimusRole } from "@optimus/auth";

/**
 * Représentation d'un utilisateur d'Optimus.
 */
export interface OptimusUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly fullName?: string;
  readonly avatarUrl?: string;
  readonly role: OptimusRole;
  readonly createdAt: string;
  readonly lastLoginAt?: string;
}

/**
 * DTO pour la mise à jour du profil utilisateur.
 */
export interface UpdateUserProfileDto {
  readonly fullName?: string;
  readonly avatarUrl?: string;
}

/**
 * DTO pour le changement de mot de passe utilisateur.
 */
export interface ChangePasswordDto {
  readonly oldPassword?: string; // Optionnel si authentification fédérée
  readonly newPassword: string;
}

/**
 * Structure de réponse pour les opérations utilisateur.
 */
export interface UserResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

/**
 * Événements liés au domaine utilisateur.
 */
export type UserEvent =
  | { readonly type: 'user.created'; readonly userId: string; readonly email: string }
  | { readonly type: 'user.updated'; readonly userId: string; readonly updatedFields: string[] }
  | { readonly type: 'user.deleted'; readonly userId: string };
