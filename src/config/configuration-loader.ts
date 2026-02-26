import { loadConfig } from "c12";
import { getDefaultConfig, type LiminalConfig } from "./defaults.js";
import { type UserConfig, userConfigSchema } from "./schema.js";

let cachedConfig: LiminalConfig | undefined;

export async function loadConfiguration(): Promise<LiminalConfig> {
	if (cachedConfig) return cachedConfig;

	const defaults = getDefaultConfig();

	const { config: fileConfig } = await loadConfig<UserConfig>({
		name: "liminaldb",
		rcFile: ".liminaldbrc",
	});

	const parsed = userConfigSchema.safeParse(fileConfig ?? {});
	const userConfig = parsed.success ? parsed.data : {};

	cachedConfig = {
		url: userConfig.url ?? defaults.url,
		outputFormat: userConfig.outputFormat ?? defaults.outputFormat,
		verbose: userConfig.verbose ?? defaults.verbose,
	};

	return cachedConfig;
}

export function applyCliOverrides(
	config: LiminalConfig,
	overrides: { json?: boolean; verbose?: boolean; url?: string },
): LiminalConfig {
	return {
		...config,
		...(overrides.json !== undefined && { outputFormat: "json" as const }),
		...(overrides.verbose !== undefined && { verbose: overrides.verbose }),
		...(overrides.url !== undefined && { url: overrides.url }),
	};
}
