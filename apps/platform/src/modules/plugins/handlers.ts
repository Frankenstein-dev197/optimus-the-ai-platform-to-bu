import { GatewayRequest, GatewayResponse } from "../../core";
import { IOptimusAPI } from "@optimus/api";

export class PluginsHandler {
  constructor(private apiService: IOptimusAPI) {}

  async handleListPlugins(req: GatewayRequest): Promise<GatewayResponse> {
    const plugins = await this.apiService.listInstalledPlugins();
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: plugins
    };
  }

  async handleTogglePlugin(req: GatewayRequest): Promise<GatewayResponse> {
    const pluginId = req.url.split("/")[4] || "";
    await this.apiService.togglePlugin(pluginId, req.body.enable);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { success: true }
    };
  }
}
