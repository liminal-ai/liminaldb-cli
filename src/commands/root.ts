import { defineCommand } from "citty";
import { QUICKSTART } from "../output/help-text.js";
import { healthCommand } from "./health.js";
import { loginCommand } from "./login.js";
import { logoutCommand } from "./logout.js";
import { prefsCommand } from "./prefs/index.js";
import { promptsCommand } from "./prompts/index.js";
import { tagsCommand } from "./tags/index.js";
import { whoamiCommand } from "./whoami.js";

export const rootCommand = defineCommand({
	meta: {
		name: "liminaldb",
		version: "0.1.0",
		description:
			"CLI for LiminalDB — agent-ergonomic prompt and skill management",
	},
	args: {
		json: {
			type: "boolean",
			description: "Output as JSON",
			default: false,
		},
		verbose: {
			type: "boolean",
			alias: "v",
			description: "Verbose output",
			default: false,
		},
		url: {
			type: "string",
			description: "Override API base URL",
		},
		quickstart: {
			type: "boolean",
			description: "Show quick reference for agents",
			default: false,
		},
	},
	subCommands: {
		login: loginCommand,
		logout: logoutCommand,
		whoami: whoamiCommand,
		health: healthCommand,
		prompts: promptsCommand,
		tags: tagsCommand,
		prefs: prefsCommand,
	},
	run({ rawArgs }) {
		// Only show quickstart when no subcommand was given
		// citty calls root run() even after subcommands, so guard against that
		const subCommandNames = [
			"login",
			"logout",
			"whoami",
			"health",
			"prompts",
			"tags",
			"prefs",
		];
		const hasSubCommand = rawArgs?.some((arg: string) =>
			subCommandNames.includes(arg),
		);
		if (!hasSubCommand) {
			console.log(QUICKSTART);
		}
	},
});
