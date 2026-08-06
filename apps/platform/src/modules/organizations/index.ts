import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class OrganizationsHandler {
  constructor(private apiService: IOptimusAPI) {}

  /** Route: GET /api/v1/organizations */
  async handleListOrgs(req: GatewayRequest): Promise<GatewayResponse> {
    const orgs = await this.apiService.listOrganizations();
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: orgs
    };
  }

  /** Route: POST /api/v1/organizations */
  async handleCreateOrg(req: GatewayRequest): Promise<GatewayResponse> {
    const newOrg = await this.apiService.createOrganization(req.body);
    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: newOrg
    };
  }
}
