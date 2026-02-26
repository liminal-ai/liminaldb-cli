import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { formatDeleteResult } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";

export const deleteCommand = defineCommand({
	meta: {
		name: "delete",
		description: "Delete a prompt by slug",
	},
	args: {
		slug: {
			type: "positional",
			required: true,
			description: "Prompt slug to delete",
		},
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const result = await client.deletePrompt(args.slug);

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(result));
		} else {
			console.log(formatDeleteResult(args.slug));
		}
	},
});
