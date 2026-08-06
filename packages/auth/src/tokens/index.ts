import { OptimusRole } from "../types";

/**
 * Charge utile (Payload) standard d'un jeton JWT SSO d'Optimus.
 * Contient les déclarations d'identité nécessaires pour authentifier l'utilisateur
 * de façon découplée sans requêter continuellement la base de données.
 */
export interface OptimusJWTPayload {
  /** Identifiant unique de l'utilisateur (subject) */
  readonly sub: string;
  /** Nom d'utilisateur */
  readonly username: string;
  /** Adresse e-mail */
  readonly email: string;
  /** Rôle global d'accès */
  readonly role: OptimusRole;
  /** Date d'émission (Issued At - Unix Timestamp) */
  readonly iat: number;
  /** Date d'expiration (Expiration Time - Unix Timestamp) */
  readonly exp: number;
  /** Émetteur du jeton (Issuer - ex: "optimus-auth") */
  readonly iss: string;
  /** Audiences cibles de ce jeton (ex: ["optimus-landing", "optimus-dev"]) */
  readonly aud: string[];
}

/**
 * Données résultant de la validation ou du décodage d'un jeton d'accès.
 */
export interface TokenValidationResult {
  /** Indique si le jeton est valide, non expiré et intègre */
  readonly isValid: boolean;
  /** Charge utile extraite du jeton (présente uniquement si valide) */
  readonly payload?: OptimusJWTPayload;
  /** Message d'erreur décrivant le problème en cas d'échec de validation */
  readonly errorReason?: string;
}
