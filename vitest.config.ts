import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	// security workaround to allow fine-grained perf measurements
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
	test: {
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({
				launchOptions: {
					// enable GPU
					args: ["--enable-gpu", "--use-angle=vulkan"],
				},
			}),
			instances: [{ browser: "chromium" }],
		},
	},
});
