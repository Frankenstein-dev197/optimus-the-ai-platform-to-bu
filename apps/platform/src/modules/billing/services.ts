import { IOptimusAPI } from "@optimus/api";

/**
 * Service de facturation et de suivi de consommation d'Optimus Gateway.
 */
export interface IGatewayBillingService {
  readonly coreApi: IOptimusAPI;
  calculateInvoiceEstimate(orgId: string): Promise<number>;
}
