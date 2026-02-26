import { defineCommand } from "citty";
import { ApiClient } from "../client/api-client.js";
import { loadConfiguration } from "../config/configuration-loader.js";
import { formatWhoami } from "../output/human-formatter.js";
import { formatJson } from "../output/json-formatter.js";

export const whoamiCommand = defineCommand({
	meta: {
		name: "whoami",
		description: "Show current authenticated user",
	},
	args: {
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const data = await client.whoami();

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(data));
		} else {
			console.log(formatWhoami(data));
		}
	},
});
