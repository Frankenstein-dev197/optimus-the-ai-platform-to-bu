import { GatewayMiddleware } from "../../core";

/**
 * Middleware de validation des données de profil utilisateur.
 */
export const validateProfileMiddleware: GatewayMiddleware = async (req, next) => {
  if (req.method === 'PUT' && !req.body) {
    return {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "Corps de requête manquant pour la modification du profil." }
    };
  }
  return await next();
};
