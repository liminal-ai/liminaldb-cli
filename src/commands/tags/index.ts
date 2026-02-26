import { defineCommand } from "citty";
import { listTagsCommand } from "./list.js";

export const tagsCommand = defineCommand({
	meta: {
		name: "tags",
		description: "Manage tags",
	},
	subCommands: {
		list: listTagsCommand,
	},
});
