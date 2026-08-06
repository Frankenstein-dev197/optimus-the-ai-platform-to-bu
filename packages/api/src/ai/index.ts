/**
 * Message au sein d'une session de chat IA d'Optimus.
 */
export interface OptimusAIChatMessage {
  readonly id: string;
  readonly sender: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: string;
}

/**
 * Session de chat persistante avec l'IA.
 */
export interface OptimusAIChatSession {
  readonly id: string;
  readonly userId: string;
  readonly workspaceId?: string;
  readonly title: string;
  readonly messages: OptimusAIChatMessage[];
  readonly createdAt: string;
}

/**
 * DTO de requête d'exécutions de commandes de codage IA.
 */
export interface OptimusAICommandRequest {
  readonly prompt: string;
  readonly workspaceId: string;
  readonly contextFiles?: string[];
}

/**
 * DTO de réponse pour l'exécution assistée de commandes d'IA.
 */
export interface OptimusAICommandResponse {
  readonly suggestedCode: string;
  readonly explanation: string;
  readonly commandsToRun?: string[];
}

/**
 * Événements du domaine d'Intelligence Artificielle d'Optimus.
 */
export type AIEvent =
  | { readonly type: 'ai.session.created'; readonly sessionId: string; readonly userId: string }
  | { readonly type: 'ai.message.sent'; readonly sessionId: string; readonly sender: string }
  | { readonly type: 'ai.command.requested'; readonly workspaceId: string; readonly prompt: string };
