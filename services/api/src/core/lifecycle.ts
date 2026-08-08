/**
 * Étape du cycle de vie du démarrage du serveur.
 */
export type LifecycleStep =
  | 'initialize'
  | 'configure'
  | 'boot'
  | 'ready'
  | 'shutdown';

/**
 * Interface pour s'abonner aux événements du cycle de vie de la plateforme.
 * Permet aux différents modules d'initialiser proprement leurs ressources.
 */
export interface ILifecycleListener {
  readonly name: string;
  onInitialize?(): Promise<void>;
  onBoot?(): Promise<void>;
  onReady?(): Promise<void>;
  onShutdown?(): Promise<void>;
}

/**
 * Orchestrateur du cycle de vie de l'application Optimus Platform.
 */
export interface IPlatformLifecycle {
  readonly currentStep: LifecycleStep;
  /** Enregistre un nouvel écouteur de cycle de vie */
  registerListener(listener: ILifecycleListener): void;
  /** Démarre la séquence de boot de la plateforme */
  boot(): Promise<void>;
  /** Arrête proprement la plateforme et libère les connexions */
  shutdown(): Promise<void>;
}
