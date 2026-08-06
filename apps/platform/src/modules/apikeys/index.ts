import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class ApiKeysHandler {
  constructor(private apiService: IOptimusAPI) {}

  /** Route: GET /api/v1/developer/apikeys */
  async handleListKeys(req: GatewayRequest): Promise<GatewayResponse> {
    const keys = await this.apiService.listApiKeys();
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: keys
    };
  }

  /** Route: POST /api/v1/developer/apikeys */
  async handleCreateKey(req: GatewayRequest): Promise<GatewayResponse> {
    const key = await this.apiService.createApiKey(req.body);
    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: key
    };
  }
}
