import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class WorkspacesHandler {
  constructor(private apiService: IOptimusAPI) {}

  /** Route: GET /api/v1/workspaces */
  async handleListWorkspaces(req: GatewayRequest): Promise<GatewayResponse> {
    const workspaces = await this.apiService.listWorkspaces();
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: workspaces
    };
  }

  /** Route: POST /api/v1/workspaces */
  async handleCreateWorkspace(req: GatewayRequest): Promise<GatewayResponse> {
    const workspace = await this.apiService.createWorkspace(req.body);
    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: workspace
    };
  }

  /** Route: POST /api/v1/workspaces/:id/start */
  async handleStartWorkspace(req: GatewayRequest): Promise<GatewayResponse> {
    const id = req.url.split("/").pop() || "";
    const workspace = await this.apiService.startWorkspace(id);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: workspace
    };
  }
}
