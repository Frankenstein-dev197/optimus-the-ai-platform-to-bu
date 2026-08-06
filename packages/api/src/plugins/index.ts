/**
 * Contrat définissant les métadonnées d'un plugin enregistré au sein d'Optimus Dev.
 */
export interface OptimusPluginMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly isEnabled: boolean;
  readonly permissionsRequired?: string[];
}

/**
 * Interface d'exécution pour un plugin d'Optimus Dev.
 */
export interface OptimusPlugin {
  readonly metadata: OptimusPluginMetadata;

  /** Méthode d'initialisation appelée lors de l'activation du plugin */
  onInitialize(context: Record<string, any>): Promise<void>;
  /** Méthode d'interruption appelée lors de la désactivation du plugin */
  onDestroy(): Promise<void>;
}

/**
 * Événements du cycle de vie des plugins.
 */
export type PluginEvent =
  | { readonly type: 'plugin.installed'; readonly pluginId: string }
  | { readonly type: 'plugin.enabled'; readonly pluginId: string }
  | { readonly type: 'plugin.disabled'; readonly pluginId: string }
  | { readonly type: 'plugin.uninstalled'; readonly pluginId: string };
