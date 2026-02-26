import { writeFileSync } from "node:fs";
import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";

export const exportCommand = defineCommand({
	meta: {
		name: "export",
		description: "Export all prompts as YAML",
	},
	args: {
		output: {
			type: "string",
			alias: "o",
			description: "Write to file instead of stdout",
		},
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		const yaml = await client.exportPrompts();

		if (args.output) {
			writeFileSync(args.output, yaml, "utf-8");
			console.log(`Exported to ${args.output}`);
		} else {
			process.stdout.write(yaml);
		}
	},
});
