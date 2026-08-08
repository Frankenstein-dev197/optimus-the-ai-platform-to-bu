import * as path from "node:path";
import babel from "@rolldown/plugin-babel";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { visualizer } from "rollup-plugin-visualizer";
import type { PluginOption } from "vite";
import checker from "vite-plugin-checker";
import { defineConfig } from "vitest/config";

// We enable profiling and source maps for internal deployments (e.g. dogfood).
// The profiling build uses react-dom/profiling, which keeps optimizations but
// preserves performance instrumentation.
const isProfilingBuild = process.env.CODER_REACT_PROFILING === "true";

const compilerPreset = reactCompilerPreset();
compilerPreset.rolldown.filter = {
	...compilerPreset.rolldown.filter,
	id: {
		// Keep in sync with targetDirs in scripts/check-compiler.mjs.
		include: [/src\/pages\/AgentsPage\//, /src\/pages\/AIBridgePage\//],
	},
};

const plugins: PluginOption[] = [
	react(),
	babel({ presets: [compilerPreset] }),
	checker({
		typescript: true,
	}),
];

if (process.env.STATS !== undefined) {
	plugins.push(
		visualizer({
			filename: "./stats/index.html",
			gzipSize: true,
		}),
	);
}

// Custom plugin to resolve noVNC correctly
const novncPlugin = {
	name: "novnc-resolve",
	resolveId(source: string) {
		if (source === "@novnc/novnc/core/rfb") {
			return {
				id: path.resolve(__dirname, "./node_modules/@novnc/novnc/core/rfb.js"),
				external: false,
			};
		}
		return null;
	},
};

plugins.push(novncPlugin as PluginOption);

export default defineConfig({
	plugins,
	worker: {
		format: "es",
	},
	publicDir: path.resolve(__dirname, "./static"),
	build: {
		outDir: path.resolve(__dirname, "./out"),
		emptyOutDir: false, // We need to keep the /bin folder and GITKEEP files
		sourcemap: isProfilingBuild ? true : "hidden",
		rolldownOptions: {
			input: {
				index: path.resolve(__dirname, "./index.html"),
				serviceWorker: path.resolve(__dirname, "./src/serviceWorker.ts"),
			},
			output: {
				entryFileNames: (chunkInfo) => {
					return chunkInfo.name === "serviceWorker"
						? "[name].js"
						: "assets/[name]-[hash].js";
				},
				codeSplitting: {
					groups: [
						{ name: "mui", test: /@mui/ },
						{ name: "emotion", test: /@emotion/ },
						{ name: "monaco", test: /monaco-editor/ },
						{ name: "xterm", test: /@xterm/ },
						{ name: "emoji-mart", test: /emoji-mart/ },
						{ name: "radix-ui", test: /radix-ui/ },
					],
				},
			},
		},
	},
	ssr: {
		noExternal: [
			"@mui/material",
			"@emotion/react",
			"@emotion/styled",
			"react",
			"react-dom",
			"react-router-dom",
			"react-hook-form",
			"@hookform/resolvers",
			"zod",
			"@tanstack/react-query",
			"@tanstack/react-virtual",
			"date-fns",
			"@floating-ui/react",
			"sonner",
			"axios",
			"clsx",
			"i18next",
			"react-i18next",
			"i18next-browser-languagedetector",
			"@sentry/react",
			"@sentry/browser",
			"@optimus-ide-collab/pixel-storybook",
			"@optimus-ide-collab/pixel-ui",
			"@optimus-ide-collab/pixel-code-editor",
			"@optimus-ide-collab/pixel-terminal",
		],
	},
	define: {
		// Suppress React version warnings from @optimus-ide-collab packages
		__UMD_DEV__: JSON.stringify(false),
	},
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		globals: true,
		environment: "happy-dom",
		setupFiles: ["src/testHelpers/setup.ts"],
		coverage: {
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/**/*.d.ts", "src/testHelpers/**"],
		},
	},
	storybook: {
		framework: {
			name: "@storybook/react-vite",
		},
		addons: [
			"@storybook/addon-essentials",
			"@storybook/addon-interactions",
			"@storybook/addon-themes",
		],
		stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
		docs: {
			autodocs: "tag",
		},
		viteFinal: async (config) => ({
			...config,
			plugins: [
				...config.plugins,
				storybookTest(),
				playwright({
					projects: [
						{
							name: "chromium",
							use: {
								channel: "chromium",
							},
						},
					],
				}),
			],
		}),
	},
});
