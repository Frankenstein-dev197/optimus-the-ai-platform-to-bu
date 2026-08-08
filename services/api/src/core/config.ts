/**
 * Spécification de la configuration d'environnement globale de la Gateway.
 */
export interface PlatformConfig {
  readonly environment: 'development' | 'production' | 'test';
  readonly serverPort: number;
  readonly ssoDomain: string; // ex: '.optimus.dev'
  readonly corsOrigins: string[];
  readonly dbUri?: string; // Cache de données, options d'intégration
  readonly redisUri?: string; // Cache distribué / bus d'événements
  readonly engineUrl: string; // Adresse de l'API du moteur Optimus
  readonly aiOrchestratorUrl: string; // Adresse de l'API de services IA Optimus
}

/**
 * Interface d'accès à la configuration de la plateforme.
 */
export interface IConfigProvider {
  /** Récupère la configuration globale active */
  get(): PlatformConfig;
  /** Récupère une valeur de configuration spécifique via sa clé */
  getValue<T>(key: keyof PlatformConfig): T;
}
