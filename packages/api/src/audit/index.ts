/**
 * Entrée de journal d'audit de sécurité de la plateforme Optimus.
 */
export interface OptimusAuditLog {
  readonly id: string;
  readonly timestamp: string;
  readonly userId: string;
  readonly username: string;
  readonly action: string; // ex: 'workspace.create', 'apikey.revoke'
  readonly resourceType: string;
  readonly resourceId: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly status: 'success' | 'failed';
  readonly details?: Record<string, any>;
}

/**
 * Filtres pour la recherche dans les journaux d'audit.
 */
export interface AuditLogFilters {
  readonly userId?: string;
  readonly action?: string;
  readonly resourceType?: string;
  readonly status?: 'success' | 'failed';
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly limit?: number;
  readonly offset?: number;
}
