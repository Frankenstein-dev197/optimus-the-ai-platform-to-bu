import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class AIHandler {
  constructor(private apiService: IOptimusAPI) {}

  /** Route: POST /api/v1/ai/chat/sessions */
  async handleCreateChatSession(req: GatewayRequest): Promise<GatewayResponse> {
    const workspaceId = req.body.workspaceId;
    const session = await this.apiService.createAIChatSession(workspaceId);
    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: session
    };
  }

  /** Route: POST /api/v1/ai/commands */
  async handleRequestCommand(req: GatewayRequest): Promise<GatewayResponse> {
    const response = await this.apiService.requestAICommand(req.body);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: response
    };
  }
}
