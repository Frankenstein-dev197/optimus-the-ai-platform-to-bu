import { OptimusOrganization, OptimusTeam } from "@optimus/auth";

/**
 * DTO pour la création d'une organisation.
 */
export interface CreateOrganizationDto {
  readonly name: string;
  readonly displayName: string;
}

/**
 * DTO pour la création d'une équipe.
 */
export interface CreateTeamDto {
  readonly name: string;
}

/**
 * Représentation d'un membre de l'organisation ou de l'équipe.
 */
export interface OrganizationMember {
  readonly userId: string;
  readonly username: string;
  readonly email: string;
  readonly role: 'owner' | 'member' | 'viewer';
  readonly joinedAt: string;
}

/**
 * Événements du domaine organisation.
 */
export type OrganizationEvent =
  | { readonly type: 'org.created'; readonly orgId: string; readonly name: string }
  | { readonly type: 'org.deleted'; readonly orgId: string }
  | { readonly type: 'team.created'; readonly teamId: string; readonly orgId: string; readonly name: string }
  | { readonly type: 'member.added'; readonly orgId: string; readonly userId: string };
