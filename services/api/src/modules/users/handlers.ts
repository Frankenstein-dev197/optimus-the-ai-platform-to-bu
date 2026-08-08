import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class UsersHandler {
  constructor(private apiService: IOptimusAPI) {}

  async handleGetMe(req: GatewayRequest): Promise<GatewayResponse> {
    const user = await this.apiService.getCurrentUser();
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: user
    };
  }

  async handleUpdateProfile(req: GatewayRequest): Promise<GatewayResponse> {
    const updatedUser = await this.apiService.updateProfile(req.body);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: updatedUser
    };
  }
}
