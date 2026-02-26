import { defineCommand } from "citty";
import { getPrefsCommand } from "./get.js";
import { setPrefsCommand } from "./set.js";

export const prefsCommand = defineCommand({
	meta: {
		name: "prefs",
		description: "Manage user preferences",
	},
	subCommands: {
		get: getPrefsCommand,
		set: setPrefsCommand,
	},
});
