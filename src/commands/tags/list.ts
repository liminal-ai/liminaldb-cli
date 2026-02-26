import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { formatTags } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";

export const listTagsCommand = defineCommand({
	meta: {
		name: "list",
		description: "List all available tags",
	},
	args: {
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const tags = await client.listTags();

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(tags));
		} else {
			console.log(formatTags(tags));
		}
	},
});
