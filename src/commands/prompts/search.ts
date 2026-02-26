import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { formatPromptList } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";

export const searchCommand = defineCommand({
	meta: {
		name: "search",
		description: "Full-text search prompts",
	},
	args: {
		query: {
			type: "positional",
			required: true,
			description: "Search query",
		},
		tags: {
			type: "string",
			description: "Comma-separated tag filter",
		},
		limit: {
			type: "string",
			description: "Maximum results",
		},
		json: { type: "boolean", default: false },
		verbose: { type: "boolean", alias: "v", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const prompts = await client.searchPrompts(args.query, {
			tags: args.tags ? args.tags.split(",").map((t) => t.trim()) : undefined,
			limit: args.limit ? Number(args.limit) : undefined,
		});

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(prompts));
		} else {
			console.log(formatPromptList(prompts, args.verbose || config.verbose));
		}
	},
});
