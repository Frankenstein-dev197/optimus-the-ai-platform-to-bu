/**
 * Liste des routes gérées par le module d'authentification.
 */
export const AUTH_ROUTES = {
  /** Point d'entrée de redirection OAuth */
  REDIRECT: '/api/v1/auth/redirect',
  /** Callback d'authentification après validation du tiers */
  CALLBACK: '/api/v1/auth/callback',
  /** Endpoint de déconnexion de la session SSO unifiée */
  LOGOUT: '/api/v1/auth/logout'
} as const;
