import { defineCommand } from "citty";
import { ApiClient } from "../../client/api-client.js";
import { loadConfiguration } from "../../config/configuration-loader.js";
import { ValidationError } from "../../errors/errors.js";
import type { Surface, ThemeId } from "../../types/api.js";

export const setPrefsCommand = defineCommand({
	meta: {
		name: "set",
		description: "Set theme preference for a surface",
	},
	args: {
		surface: {
			type: "string",
			description: "Surface: webapp, chatgpt, or vscode",
			required: true,
		},
		theme: {
			type: "string",
			description: "Theme: light-1, light-2, light-3, dark-1, dark-2, dark-3",
			required: true,
		},
	},
	async run({ args }) {
		const validSurfaces = ["webapp", "chatgpt", "vscode"];
		const validThemes = [
			"light-1",
			"light-2",
			"light-3",
			"dark-1",
			"dark-2",
			"dark-3",
		];

		if (!validSurfaces.includes(args.surface)) {
			throw new ValidationError(
				`Invalid surface: ${args.surface}. Use: ${validSurfaces.join(", ")}`,
			);
		}
		if (!validThemes.includes(args.theme)) {
			throw new ValidationError(
				`Invalid theme: ${args.theme}. Use: ${validThemes.join(", ")}`,
			);
		}

		const config = await loadConfiguration();
		const client = new ApiClient(config.url);
		await client.setPreferences(args.surface as Surface, args.theme as ThemeId);

		console.log(`Set ${args.surface} theme to ${args.theme}.`);
	},
});
