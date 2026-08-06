import { IAuthService } from "@optimus/auth";

/**
 * Service interne d'authentification propre au module d'authentification Gateway.
 * Gère l'orchestration du SSO unifié et l'échange de clés API.
 */
export interface IGatewayAuthService {
  /** Référence vers le service d'authentification partagé du monorepo */
  readonly coreAuth: IAuthService;

  /** Valide l'accès et obtient les droits d'un utilisateur SSO */
  authenticateSSO(token: string): Promise<any>;
}
