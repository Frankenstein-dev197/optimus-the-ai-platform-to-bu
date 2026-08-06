import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class BillingHandler {
  constructor(private apiService: IOptimusAPI) {}

  async handleGetUsage(req: GatewayRequest): Promise<GatewayResponse> {
    const orgId = req.url.split("/")[4] || "";
    const usage = await this.apiService.getBillingUsage(orgId);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: usage
    };
  }
}
