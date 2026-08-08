import { GatewayRequest, GatewayResponse } from "../../core";
import { IAuthService } from "@optimus/auth";

export class AuthHandler {
  constructor(private authService: IAuthService) {}

  /** Gère la redirection d'autorisation OAuth */
  async handleRedirect(req: GatewayRequest): Promise<GatewayResponse> {
    const providerId = req.query.provider as any;
    const redirectUri = (req.query.redirect_uri as string) || "https://dev.optimus.dev/callback";
    const state = "optimus_state_secret";

    const redirectUrl = await this.authService.oauth.getAuthRedirectUrl(providerId, redirectUri, state);
    return {
      status: 302,
      headers: { Location: redirectUrl },
      body: { redirectUrl }
    };
  }

  /** Gère le retour de callback et d'échange de jetons */
  async handleCallback(req: GatewayRequest): Promise<GatewayResponse> {
    const providerId = req.body.provider;
    const code = req.body.code;
    const redirectUri = req.body.redirect_uri;

    const userProfile = await this.authService.oauth.handleOAuthCallback(providerId, code, redirectUri);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { success: true, user: userProfile }
    };
  }

  /** Gère la révocation de session lors du logout */
  async handleLogout(req: GatewayRequest): Promise<GatewayResponse> {
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { success: true, message: "Déconnexion SSO réussie." }
    };
  }
}
