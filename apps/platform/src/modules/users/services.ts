import { IOptimusAPI } from "@optimus/api";

/**
 * Service de gestion des utilisateurs de la Gateway.
 * S'appuie exclusivement sur les contrats partagés @optimus/api.
 */
export interface IGatewayUserService {
  readonly coreApi: IOptimusAPI;
  getUserProfile(userId: string): Promise<any>;
}
