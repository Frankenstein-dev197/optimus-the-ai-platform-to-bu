import { OptimusPermission, OptimusRole } from "../types";

/**
 * Mappage de rôles vers un ensemble de permissions d'infrastructure et d'API.
 * Définit la politique d'autorisation statique par défaut.
 */
export interface RolePermissionMapping {
  /** Rôle global concerné */
  readonly role: OptimusRole;
  /** Liste de permissions granulaires accordées */
  readonly permissions: OptimusPermission[];
}

/**
 * Structure décrivant l'évaluation d'une règle d'autorisation pour un utilisateur.
 */
export interface PermissionCheckResult {
  /** Indique si l'accès est accordé ou non */
  readonly isAllowed: boolean;
  /** Liste des motifs ou des permissions manquantes en cas de refus */
  readonly missingPermissions?: OptimusPermission[];
}
