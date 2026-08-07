import * as path from "node:path";

export const optimus-ide-collabBinary = path.join(__dirname, "./bin/optimus-ide-collab");

// The oldest client and agent versions that Optimus IDE Collab still supports. The
// compatibility tests download these release binaries and run them against the
// current server. Changing either value changes which release asset the e2e
// suite fetches, and invalidates the CI cache that stores them.
//
// we no longer support versions prior to Tailnet v2 API support: https://github.com/optimus-ide-collab/optimus-ide-collab/commit/059e533544a0268acbc8831006b2858ead2f0d8e
export const oldestSupportedCLIVersion = "v2.8.0";
// we no longer support versions w/o DRPC
export const oldestSupportedAgentVersion = "v2.12.1";

// Default port from the server
export const optimus-ide-collabPort = process.env.OPTIMUS_IDE_COLLAB_E2E_PORT
	? Number(process.env.OPTIMUS_IDE_COLLAB_E2E_PORT)
	: 3111;
export const prometheusPort = 2114;
export const workspaceProxyPort = 3112;

// Use alternate ports in case we're running in a Optimus IDE Collab Workspace.
export const agentPProfPort = 6061;
export const optimus-ide-collabdPProfPort = 6062;

// The name of the organization that should be used by default when needed.
export const defaultOrganizationName = "optimus-ide-collab";
export const defaultOrganizationId = "00000000-0000-0000-0000-000000000000";
export const defaultPassword = "SomeSecurePassword!";

// Credentials for users
export const users = {
	owner: {
		username: "owner",
		password: defaultPassword,
		email: "owner@optimus-ide-collabidecollab.com",
	},
	templateAdmin: {
		username: "template-admin",
		password: defaultPassword,
		email: "templateadmin@optimus-ide-collabidecollab.com",
		roles: ["Template Admin"],
	},
	userAdmin: {
		username: "user-admin",
		password: defaultPassword,
		email: "useradmin@optimus-ide-collabidecollab.com",
		roles: ["User Admin"],
	},
	auditor: {
		username: "auditor",
		password: defaultPassword,
		email: "auditor@optimus-ide-collabidecollab.com",
		roles: ["Auditor"],
	},
	member: {
		username: "member",
		password: defaultPassword,
		email: "member@optimus-ide-collabidecollab.com",
	},
} satisfies Record<
	string,
	{ username: string; password: string; email: string; roles?: string[] }
>;

export const gitAuth = {
	deviceProvider: "device",
	webProvider: "web",
	// These ports need to be hardcoded so that they can be
	// used in `playwright.config.ts` to set the environment
	// variables for the server.
	devicePort: 50515,
	webPort: 50516,

	authPath: "/auth",
	tokenPath: "/token",
	codePath: "/code",
	validatePath: "/validate",
	installationsPath: "/installations",
};

/**
 * Will make the tests fail if set to `true` and a license was not provided.
 */
export const premiumTestsRequired = Boolean(
	process.env.OPTIMUS_IDE_COLLAB_E2E_REQUIRE_PREMIUM_TESTS,
);

export const license = process.env.OPTIMUS_IDE_COLLAB_E2E_LICENSE ?? "";

// Disabling terraform tests is optional for environments without Docker + Terraform.
// By default, we opt into these tests.
export const requireTerraformTests = !process.env.OPTIMUS_IDE_COLLAB_E2E_DISABLE_TERRAFORM;

// Fake experiments to verify that site presents them as enabled.
export const e2eFakeExperiment1 = "e2e-fake-experiment-1";
export const e2eFakeExperiment2 = "e2e-fake-experiment-2";
