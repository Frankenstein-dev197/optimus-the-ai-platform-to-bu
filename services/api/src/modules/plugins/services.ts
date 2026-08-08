import { IOptimusAPI } from "@optimus/api";

export interface IGatewayPluginService {
  readonly coreApi: IOptimusAPI;
  verifyPluginHash(pluginId: string): Promise<boolean>;
}
