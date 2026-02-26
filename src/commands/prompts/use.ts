import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { formatUsageTracked } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";

export const useCommand = defineCommand({
	meta: {
		name: "use",
		description: "Track prompt usage (increments usage count)",
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
		await client.trackUsage(args.slug);

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson({ tracked: true, slug: args.slug }));
		} else {
			console.log(formatUsageTracked(args.slug));
		}
	},
});
