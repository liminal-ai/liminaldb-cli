import { defineCommand } from "citty";
import { deleteCommand } from "./delete.js";
import { exportCommand } from "./export.js";
import { getCommand } from "./get.js";
import { importCommand } from "./import.js";
import { listCommand } from "./list.js";
import { saveCommand } from "./save.js";
import { searchCommand } from "./search.js";
import { updateCommand } from "./update.js";
import { useCommand } from "./use.js";

export const promptsCommand = defineCommand({
	meta: {
		name: "prompts",
		description: "Manage prompts",
	},
	subCommands: {
		list: listCommand,
		search: searchCommand,
		get: getCommand,
		save: saveCommand,
		update: updateCommand,
		delete: deleteCommand,
		use: useCommand,
		export: exportCommand,
		import: importCommand,
	},
});
