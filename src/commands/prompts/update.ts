import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { formatUpdateResult } from "../../output/human-formatter.js";
import { formatJson } from "../../output/json-formatter.js";
import type { PromptUpdate } from "../../types/api.js";

export const updateCommand = defineCommand({
	meta: {
		name: "update",
		description: "Update a prompt by slug (partial updates supported)",
	},
	args: {
		slug: {
			type: "positional",
			required: true,
			description: "Prompt slug to update",
		},
		name: { type: "string", description: "New name" },
		description: { type: "string", alias: "d", description: "New description" },
		content: { type: "string", alias: "c", description: "New content" },
		tags: {
			type: "string",
			description: "Comma-separated tags (replaces existing)",
		},
		pin: { type: "boolean", description: "Pin the prompt" },
		unpin: { type: "boolean", description: "Unpin the prompt" },
		favorite: { type: "boolean", description: "Favorite the prompt" },
		unfavorite: { type: "boolean", description: "Unfavorite the prompt" },
		json: { type: "boolean", default: false },
	},
	async run({ args }) {
		const config = await loadConfiguration();
		const client = new ApiClient(config.url);

		const updates: PromptUpdate = {};
		if (args.name) updates.name = args.name;
		if (args.description) updates.description = args.description;
		if (args.content) updates.content = args.content;
		if (args.tags)
			updates.tags = args.tags
				.split(",")
				.map((t) => t.trim()) as PromptUpdate["tags"];
		if (args.pin) updates.pinned = true;
		if (args.unpin) updates.pinned = false;
		if (args.favorite) updates.favorited = true;
		if (args.unfavorite) updates.favorited = false;

		const result = await client.updatePrompt(args.slug, updates);

		if (args.json || config.outputFormat === "json") {
			console.log(formatJson(result));
		} else {
			console.log(formatUpdateResult(result.updated));
		}
	},
});
