#!/usr/bin/env node

import { runCommand } from "citty";
import { rootCommand } from "./commands/root.js";
import { errorHint, LiminalError } from "./errors/errors.js";
import { formatJsonError } from "./output/json-formatter.js";

const isJson =
	process.argv.includes("--json") ||
	process.env.LIMINALDB_OUTPUT_FORMAT === "json";

try {
	await runCommand(rootCommand, { rawArgs: process.argv.slice(2) });
} catch (error) {
	if (error instanceof LiminalError) {
		if (isJson) {
			console.error(formatJsonError(error));
		} else {
			console.error(`Error: ${error.message}`);
			const hint = errorHint(error);
			if (hint) console.error(`Hint: ${hint}`);
		}
		process.exit(1);
	}

	// Unknown error
	if (isJson) {
		console.error(
			formatJsonError(
				error instanceof Error ? error : new Error(String(error)),
			),
		);
	} else {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
	process.exit(1);
}
