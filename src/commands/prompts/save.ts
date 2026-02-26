import { readFileSync } from "node:fs";
import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { ValidationError } from "../../errors/errors.js";
import { formatSaveResult } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";
import type { PromptInput } from "../../types/api.js";

export const saveCommand = defineCommand({
	meta: {
		name: "save",
		description: "Save one or more prompts",
	},
	args: {
		stdin: {
			type: "boolean",
			description: "Read prompt JSON from stdin",
			default: false,
		},
		file: {
			type: "string",
			alias: "f",
			description: "Read prompt JSON from file",
		},
		slug: {
			type: "string",
			description: "Prompt slug (inline mode)",
		},
		name: {
			type: "string",
			description: "Prompt name (inline mode)",
		},
		description: {
			type: "string",
			alias: "d",
			description: "Prompt description (inline mode)",
		},
		content: {
			type: "string",
			alias: "c",
			description: "Prompt content (inline mode)",
		},
		tags: {
			type: "string",
			description: "Comma-separated tags (inline mode)",
		},
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		let prompts: PromptInput[];

		if (args.stdin) {
			const input = readStdin();
			prompts = parsePromptInput(input);
		} else if (args.file) {
			const input = readFileSync(args.file, "utf-8");
			prompts = parsePromptInput(input);
		} else if (args.slug && args.name && args.content) {
			prompts = [
				{
					slug: args.slug,
					name: args.name,
					description: args.description ?? args.name,
					content: args.content,
					tags: args.tags
						? (args.tags.split(",").map((t) => t.trim()) as PromptInput["tags"])
						: [],
				},
			];
		} else {
			throw new ValidationError(
				"Provide --stdin, --file, or all of --slug --name --content.",
			);
		}

		const result = await client.savePrompts(prompts);

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(result));
		} else {
			console.log(formatSaveResult(result.ids));
		}
	},
});

function readStdin(): string {
	return readFileSync("/dev/stdin", "utf-8");
}

function parsePromptInput(input: string): PromptInput[] {
	const parsed = JSON.parse(input);
	if (Array.isArray(parsed)) return parsed as PromptInput[];
	if (parsed.prompts && Array.isArray(parsed.prompts))
		return parsed.prompts as PromptInput[];
	return [parsed as PromptInput];
}
