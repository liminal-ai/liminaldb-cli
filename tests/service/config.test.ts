import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRODUCTION_URL, getDefaultConfig } from "../../src/config/defaults.js";

beforeEach(() => {
	vi.stubEnv("LIMINALDB_URL", "");
	vi.stubEnv("LIMINALDB_OUTPUT_FORMAT", "");
	vi.stubEnv("LIMINALDB_VERBOSE", "");
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("getDefaultConfig", () => {
	it("returns production URL by default", () => {
		const config = getDefaultConfig();
		expect(config.url).toBe(PRODUCTION_URL);
		expect(config.outputFormat).toBe("human");
		expect(config.verbose).toBe(false);
	});

	it("reads LIMINALDB_URL from env", () => {
		vi.stubEnv("LIMINALDB_URL", "https://custom.example.com");

		const config = getDefaultConfig();
		expect(config.url).toBe("https://custom.example.com");
	});

	it("reads LIMINALDB_OUTPUT_FORMAT from env", () => {
		vi.stubEnv("LIMINALDB_OUTPUT_FORMAT", "json");

		const config = getDefaultConfig();
		expect(config.outputFormat).toBe("json");
	});

	it("reads LIMINALDB_VERBOSE from env", () => {
		vi.stubEnv("LIMINALDB_VERBOSE", "true");
		expect(getDefaultConfig().verbose).toBe(true);

		vi.stubEnv("LIMINALDB_VERBOSE", "1");
		expect(getDefaultConfig().verbose).toBe(true);
	});

	it("ignores invalid output format", () => {
		vi.stubEnv("LIMINALDB_OUTPUT_FORMAT", "xml");

		const config = getDefaultConfig();
		expect(config.outputFormat).toBe("human");
	});
});
