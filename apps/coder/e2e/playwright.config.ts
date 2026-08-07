import * as path from "node:path";
import { defineConfig } from "@playwright/test";
import {
	optimus-ide-collabBinary,
	optimus-ide-collabdPProfPort,
	optimus-ide-collabPort,
	e2eFakeExperiment1,
	e2eFakeExperiment2,
	gitAuth,
	requireTerraformTests,
} from "./constants";

export const wsEndpoint = process.env.OPTIMUS_IDE_COLLAB_E2E_WS_ENDPOINT;
export const retries = (() => {
	if (process.env.OPTIMUS_IDE_COLLAB_E2E_TEST_RETRIES === undefined) {
		return undefined;
	}
	const count = Number.parseInt(process.env.OPTIMUS_IDE_COLLAB_E2E_TEST_RETRIES, 10);
	if (Number.isNaN(count)) {
		throw new Error(
			`OPTIMUS_IDE_COLLAB_E2E_TEST_RETRIES is not a number: ${process.env.OPTIMUS_IDE_COLLAB_E2E_TEST_RETRIES}`,
		);
	}
	if (count < 0) {
		throw new Error(
			`OPTIMUS_IDE_COLLAB_E2E_TEST_RETRIES is less than 0: ${process.env.OPTIMUS_IDE_COLLAB_E2E_TEST_RETRIES}`,
		);
	}
	return count;
})();

const localURL = (port: number, path: string): string => {
	return `http://localhost:${port}${path}`;
};

export default defineConfig({
	retries,
	globalSetup: require.resolve("./setup/preflight"),
	outputDir: "../test-results",
	projects: [
		{
			name: "testsSetup",
			testMatch: /setup\/.*\.spec\.ts/,
		},
		{
			name: "tests",
			testMatch: /tests\/.*\.spec\.ts/,
			dependencies: ["testsSetup"],
			timeout: 30_000,
		},
	],
	reporter: [
		["list"],
		["html", { open: "never" }],
		[
			"json",
			{ outputFile: path.join(__dirname, "../test-results/results.json") },
		],
		["./reporter.ts"],
	],
	use: {
		actionTimeout: 5000,
		baseURL: `http://localhost:${optimus-ide-collabPort}`,
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
		video: "retain-on-failure",
		...(wsEndpoint
			? {
					connectOptions: {
						wsEndpoint: wsEndpoint,
					},
				}
			: {
					launchOptions: {
						args: ["--disable-webgl"],
					},
				}),
	},
	webServer: {
		url: `http://localhost:${optimus-ide-collabPort}/healthz`,
		// The default timeout is 60s, but optimus-ide-collabd startup can take longer on
		// loaded CI runners.
		timeout: 120_000,
		command: [
			`"${optimus-ide-collabBinary}"`,
			"server",
			"--global-config $(mktemp -d -t e2e-XXXXXXXXXX)",
			`--access-url=http://localhost:${optimus-ide-collabPort}`,
			`--http-address=0.0.0.0:${optimus-ide-collabPort}`,
			"--ephemeral",
			"--telemetry=false",
			"--dangerous-disable-rate-limits",
			"--provisioner-daemons 10",
			// TODO: Enable some terraform provisioners
			`--provisioner-types=echo${requireTerraformTests ? ",terraform" : ""}`,
			"--provisioner-daemons=10",
			"--web-terminal-renderer=dom",
			"--pprof-enable",
			"--log-filter=.*",
			`--log-human=${path.join(__dirname, "test-results/debug.log")}`,
		]
			.filter(Boolean)
			.join(" "),
		stdout: "pipe",
		env: {
			...process.env,
			// Otherwise, the runner fails on Mac with: could not determine kind of name for C.uuid_string_t
			CGO_ENABLED: "0",

			// This is the test provider for git auth with devices!
			OPTIMUS_IDE_COLLAB_GITAUTH_0_ID: gitAuth.deviceProvider,
			OPTIMUS_IDE_COLLAB_GITAUTH_0_TYPE: "github",
			OPTIMUS_IDE_COLLAB_GITAUTH_0_CLIENT_ID: "client",
			OPTIMUS_IDE_COLLAB_GITAUTH_0_CLIENT_SECRET: "secret",
			OPTIMUS_IDE_COLLAB_GITAUTH_0_DEVICE_FLOW: "true",
			OPTIMUS_IDE_COLLAB_GITAUTH_0_APP_INSTALL_URL:
				"https://github.com/apps/optimus-ide-collab/installations/new",
			OPTIMUS_IDE_COLLAB_GITAUTH_0_APP_INSTALLATIONS_URL: localURL(
				gitAuth.devicePort,
				gitAuth.installationsPath,
			),
			OPTIMUS_IDE_COLLAB_GITAUTH_0_TOKEN_URL: localURL(
				gitAuth.devicePort,
				gitAuth.tokenPath,
			),
			OPTIMUS_IDE_COLLAB_GITAUTH_0_DEVICE_CODE_URL: localURL(
				gitAuth.devicePort,
				gitAuth.codePath,
			),
			OPTIMUS_IDE_COLLAB_GITAUTH_0_VALIDATE_URL: localURL(
				gitAuth.devicePort,
				gitAuth.validatePath,
			),

			OPTIMUS_IDE_COLLAB_GITAUTH_1_ID: gitAuth.webProvider,
			OPTIMUS_IDE_COLLAB_GITAUTH_1_TYPE: "github",
			OPTIMUS_IDE_COLLAB_GITAUTH_1_CLIENT_ID: "client",
			OPTIMUS_IDE_COLLAB_GITAUTH_1_CLIENT_SECRET: "secret",
			OPTIMUS_IDE_COLLAB_GITAUTH_1_AUTH_URL: localURL(gitAuth.webPort, gitAuth.authPath),
			OPTIMUS_IDE_COLLAB_GITAUTH_1_TOKEN_URL: localURL(gitAuth.webPort, gitAuth.tokenPath),
			OPTIMUS_IDE_COLLAB_GITAUTH_1_DEVICE_CODE_URL: localURL(
				gitAuth.webPort,
				gitAuth.codePath,
			),
			OPTIMUS_IDE_COLLAB_GITAUTH_1_VALIDATE_URL: localURL(
				gitAuth.webPort,
				gitAuth.validatePath,
			),
			OPTIMUS_IDE_COLLAB_PPROF_ADDRESS: `127.0.0.1:${optimus-ide-collabdPProfPort}`,
			OPTIMUS_IDE_COLLAB_EXPERIMENTS: `${e2eFakeExperiment1},${e2eFakeExperiment2}`,

			// Tests for Deployment / User Authentication / OIDC
			OPTIMUS_IDE_COLLAB_OIDC_ISSUER_URL: "https://accounts.google.com",
			OPTIMUS_IDE_COLLAB_OIDC_EMAIL_DOMAIN: "optimus-ide-collabidecollab.com",
			OPTIMUS_IDE_COLLAB_OIDC_CLIENT_ID: "1234567890",
			OPTIMUS_IDE_COLLAB_OIDC_CLIENT_SECRET: "1234567890Secret",
			OPTIMUS_IDE_COLLAB_OIDC_ALLOW_SIGNUPS: "false",
			OPTIMUS_IDE_COLLAB_OIDC_SIGN_IN_TEXT: "Hello",
			OPTIMUS_IDE_COLLAB_OIDC_ICON_URL: "/icon/google.svg",
		},
		reuseExistingServer: false,
	},
});
