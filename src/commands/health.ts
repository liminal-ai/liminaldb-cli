import { defineCommand } from "citty";
import { ApiClient } from "../client/api-client.js";
import { loadConfiguration } from "../config/configuration-loader.js";
import { formatHealth } from "../output/human-formatter.js";
import { formatJson } from "../output/json-formatter.js";

export const healthCommand = defineCommand({
	meta: {
		name: "health",
		description: "Check LiminalDB service status",
	},
	args: {
		json: { type: "boolean", default: false },
		auth: {
			type: "boolean",
			description: "Use authenticated health check (includes user info)",
			default: false,
		},
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const data = args.auth ? await client.healthAuth() : await client.health();

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(data));
		} else {
			console.log(formatHealth(data));
		}
	},
});
