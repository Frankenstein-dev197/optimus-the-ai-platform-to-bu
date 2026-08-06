import { OptimusSDKClient } from "../client";

/**
 * Cycle de vie et métadonnées d'un plugin d'extension pour le SDK Optimus.
 * Permet aux développeurs d'ajouter des capacités au SDK (ex: injection de télémétrie, analytics, IA locale, etc.).
 */
export interface ISDKPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  /** Initialisation du plugin avec l'instance active du SDK Client */
  onInstall(client: OptimusSDKClient): void;

  /** Exécuté lors du démontage ou de l'inactivation du plugin */
  onUninstall?(client: OptimusSDKClient): void;
}
