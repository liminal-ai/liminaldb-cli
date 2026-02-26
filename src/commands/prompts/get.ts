import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { formatPromptDetail } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";

export const getCommand = defineCommand({
	meta: {
		name: "get",
		description: "Get a prompt by slug",
	},
	args: {
		slug: {
			type: "positional",
			required: true,
			description: "Prompt slug",
		},
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const prompt = await client.getPrompt(args.slug);

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(prompt));
		} else {
			console.log(formatPromptDetail(prompt));
		}
	},
});
