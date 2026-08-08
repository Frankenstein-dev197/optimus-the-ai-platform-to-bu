import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class AuditHandler {
  constructor(private apiService: IOptimusAPI) {}

  /** Route: GET /api/v1/organizations/:id/audit-logs */
  async handleListLogs(req: GatewayRequest): Promise<GatewayResponse> {
    const orgId = req.url.split("/")[4] || "";
    const logs = await this.apiService.listAuditLogs(orgId);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: logs
    };
  }
}
