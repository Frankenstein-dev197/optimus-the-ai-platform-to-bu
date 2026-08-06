/**
 * Code d'erreur standardisé de la plateforme.
 */
export type PlatformErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'QUOTA_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

/**
 * Exception personnalisée de la plateforme Optimus Dev.
 */
export class PlatformException extends Error {
  constructor(
    readonly code: PlatformErrorCode,
    message: string,
    readonly status: number = 500,
    readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PlatformException';
    Object.setPrototypeOf(this, PlatformException.prototype);
  }
}

/**
 * Interface pour le gestionnaire d'erreurs global de l'application.
 */
export interface IErrorHandler {
  /** Capture, log et transforme une erreur en réponse HTTP standardisée */
  handle(error: Error): {
    readonly status: number;
    readonly error: {
      readonly code: PlatformErrorCode | 'UNKNOWN_ERROR';
      readonly message: string;
      readonly details?: Record<string, any>;
    };
  };
}
