import { IOptimusAPI } from "@optimus/api";

export interface IGatewayOrganizationService {
  readonly coreApi: IOptimusAPI;
  getOrgTeams(orgId: string): Promise<any>;
}
