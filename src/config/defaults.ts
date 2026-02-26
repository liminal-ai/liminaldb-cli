export const PRODUCTION_URL = "https://liminaldb.com";
export const STAGING_URL = "https://promptdb-staging.fly.dev";

export interface LiminalConfig {
	url: string;
	outputFormat: "human" | "json";
	verbose: boolean;
}

export function getDefaultConfig(): LiminalConfig {
	return {
		url: process.env.LIMINALDB_URL || PRODUCTION_URL,
		outputFormat: parseOutputFormat(process.env.LIMINALDB_OUTPUT_FORMAT),
		verbose: parseBool(process.env.LIMINALDB_VERBOSE),
	};
}

function parseOutputFormat(value: string | undefined): "human" | "json" {
	if (value === "json") return "json";
	return "human";
}

function parseBool(value: string | undefined): boolean {
	return value === "1" || value === "true";
}
