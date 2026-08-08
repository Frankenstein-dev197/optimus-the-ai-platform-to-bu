/**
 * Contrat pour un événement système générique de la plateforme.
 */
export interface PlatformEvent<T = any> {
  readonly id: string;
  readonly type: string;
  readonly timestamp: string;
  readonly payload: T;
  readonly userId?: string;
  readonly orgId?: string;
}

/**
 * Gestionnaire (Listener) pour un type d'événement donné.
 */
export type PlatformEventListener<T = any> = (event: PlatformEvent<T>) => Promise<void>;

/**
 * Interface d'orchestration pour le bus d'événements interne d'Optimus.
 */
export interface IEventBus {
  /** Publie un nouvel événement sur le bus */
  publish<T>(event: PlatformEvent<T>): Promise<void>;
  /** S'abonne à un type d'événement spécifique */
  subscribe<T>(eventType: string, listener: PlatformEventListener<T>): void;
  /** Désabonne un gestionnaire d'un événement */
  unsubscribe<T>(eventType: string, listener: PlatformEventListener<T>): void;
}
