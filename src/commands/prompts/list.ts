import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { formatPromptList } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";

export const listCommand = defineCommand({
	meta: {
		name: "list",
		description: "List prompts (ranked by usage, recency, favorites)",
	},
	args: {
		limit: {
			type: "string",
			description: "Maximum number of prompts to return",
		},
		tags: {
			type: "string",
			description: "Comma-separated tag filter",
		},
		json: { type: "boolean", default: false },
		verbose: { type: "boolean", alias: "v", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const prompts = await client.listPrompts({
			limit: args.limit ? Number(args.limit) : undefined,
			tags: args.tags ? args.tags.split(",").map((t) => t.trim()) : undefined,
		});

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(prompts));
		} else {
			console.log(formatPromptList(prompts, args.verbose || config.verbose));
		}
	},
});
