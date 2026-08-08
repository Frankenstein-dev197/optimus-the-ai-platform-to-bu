import { GatewayRequest, GatewayResponse } from "./index";

/**
 * Signature pour un appel RPC ou transport découplé.
 */
export interface TransportRequest<T = any> {
  readonly transport: 'rest' | 'grpc' | 'websocket' | 'event' | 'cli';
  readonly path: string;
  readonly payload: T;
  readonly metadata: Record<string, string>;
}

export interface TransportResponse<T = any> {
  readonly status: number;
  readonly payload: T;
  readonly metadata?: Record<string, string>;
}

/**
 * Interface pour un gestionnaire de transport unifié.
 * Permet d'exposer la Gateway Optimus sur plusieurs transports (ex: REST et gRPC) sans ré-écriture.
 */
export interface ITransportAdapter {
  readonly transportId: string;

  /** Initialise et met en écoute le transport de communication */
  start(): Promise<void>;

  /** Reçoit, formate et délègue la requête au contrôleur correspondant */
  dispatch<TReq, TRes>(req: TransportRequest<TReq>): Promise<TransportResponse<TRes>>;

  /** Arrête proprement le transport de communication */
  stop(): Promise<void>;
}
