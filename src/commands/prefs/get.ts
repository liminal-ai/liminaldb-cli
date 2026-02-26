import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { formatPreference } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";
import type { Surface } from "../../types/api.js";

export const getPrefsCommand = defineCommand({
	meta: {
		name: "get",
		description: "Get theme preference for a surface",
	},
	args: {
		surface: {
			type: "string",
			description: "Surface: webapp, chatgpt, or vscode (default: webapp)",
		},
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const result = await client.getPreferences(
			args.surface as Surface | undefined,
		);

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(result));
		} else {
			console.log(formatPreference(result.theme));
		}
	},
});
