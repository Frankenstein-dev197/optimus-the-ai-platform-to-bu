import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class GitHandler {
  constructor(private apiService: IOptimusAPI) {}

  /** Route: GET /api/v1/developer/git/accounts */
  async handleListGitAccounts(req: GatewayRequest): Promise<GatewayResponse> {
    const accounts = await this.apiService.listLinkedGitAccounts();
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: accounts
    };
  }

  /** Route: POST /api/v1/developer/git/projects */
  async handleImportRepository(req: GatewayRequest): Promise<GatewayResponse> {
    const project = await this.apiService.importGitRepository(req.body);
    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: project
    };
  }
}
