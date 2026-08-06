import { GatewayMiddleware } from "../../core";

/**
 * Middleware vérifiant si l'organisation possède un moyen de facturation valide
 * (ex: carte bancaire configurée sur Stripe) ou si son compte est en souffrance.
 */
export const billingStatusMiddleware: GatewayMiddleware = async (req, next) => {
  const accountSuspended = false; // Simulation
  if (accountSuspended) {
    return {
      status: 402,
      headers: { "Content-Type": "application/json" },
      body: { error: "Paiement requis - Votre compte est suspendu pour défaut de facturation." }
    };
  }
  return await next();
};
