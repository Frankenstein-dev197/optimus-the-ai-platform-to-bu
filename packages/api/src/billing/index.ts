/**
 * Représentation du quota attribué à une organisation.
 */
export interface OptimusQuota {
  readonly id: string;
  readonly orgId: string;
  readonly maxWorkspaces: number;
  readonly maxCpuCores: number;
  readonly maxMemoryGB: number;
  readonly maxDiskGB: number;
  readonly usedWorkspaces: number;
  readonly usedCpuCores: number;
  readonly usedMemoryGB: number;
  readonly usedDiskGB: number;
}

/**
 * Rapport d'utilisation et de facturation basé sur la consommation (Stripe).
 */
export interface OptimusBillingUsage {
  readonly id: string;
  readonly orgId: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly computeSeconds: number;
  readonly computeCostUSD: number;
  readonly aiTokensUsed: number;
  readonly aiCostUSD: number;
  readonly totalCostUSD: number;
}

/**
 * Événements du domaine facturation.
 */
export type BillingEvent =
  | { readonly type: 'quota.exceeded'; readonly orgId: string; readonly resourceType: string }
  | { readonly type: 'billing.invoice.generated'; readonly orgId: string; readonly amountUSD: number };
