import { readFileSync } from "node:fs";
import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { ValidationError } from "../../errors/errors.js";
import { formatImportPreview } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";

export const importCommand = defineCommand({
	meta: {
		name: "import",
		description: "Import prompts from YAML file",
	},
	args: {
		file: {
			type: "positional",
			required: true,
			description: "Path to YAML file",
		},
		preview: {
			type: "boolean",
			description: "Preview import without applying changes",
			default: false,
		},
		slugs: {
			type: "string",
			description: "Comma-separated slugs to import (subset of file)",
		},
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);

		let yaml: string;
		try {
			yaml = readFileSync(args.file, "utf-8");
		} catch {
			throw new ValidationError(`Cannot read file: ${args.file}`);
		}

		if (args.preview) {
			const preview = await client.importPreview(yaml);
			if (args.json || config.outputFormat === "json") {
				console.log(formatJson(preview));
			} else {
				console.log(formatImportPreview(preview));
			}
			return;
		}

		const slugs = args.slugs
			? args.slugs.split(",").map((s) => s.trim())
			: undefined;

		const result = await client.importPrompts(yaml, slugs);

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(result));
		} else {
			console.log(
				`Imported ${result.imported} prompt(s). Skipped ${result.skipped} duplicate(s).`,
			);
		}
	},
});
