import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const CLI = resolve(import.meta.dirname, "../../dist/cli.js");
const API_KEY = process.env.LIMINALDB_API_KEY ?? "test-integration-key";
const BASE_URL = process.env.LIMINALDB_URL ?? "https://liminaldb.com";

function run(
	args: string,
	env?: Record<string, string>,
): { stdout: string; exitCode: number } {
	try {
		const stdout = execSync(`node ${CLI} ${args}`, {
			env: {
				...process.env,
				LIMINALDB_API_KEY: API_KEY,
				LIMINALDB_URL: BASE_URL,
				...env,
			},
			encoding: "utf-8",
			timeout: 10000,
		});
		return { stdout, exitCode: 0 };
	} catch (error) {
		const execError = error as {
			stdout?: string;
			stderr?: string;
			status?: number;
		};
		return {
			stdout: (execError.stdout ?? "") + (execError.stderr ?? ""),
			exitCode: execError.status ?? 1,
		};
	}
}

// --- Structural ---

describe("CLI structure", () => {
	it("shows quickstart when called with no args", () => {
		const { stdout, exitCode } = run("");
		expect(exitCode).toBe(0);
		expect(stdout).toContain("liminaldb");
		expect(stdout).toContain("prompts list");
		expect(stdout).toContain("LIMINALDB_API_KEY");
	});

	it("exits 1 with hint when not authenticated", () => {
		const { stdout, exitCode } = run("prompts list", { LIMINALDB_API_KEY: "" });
		expect(exitCode).toBe(1);
		expect(stdout).toContain("Not authenticated");
		expect(stdout).toContain("liminaldb login");
	});
});

// --- Health (no auth required) ---

describe("health endpoint", () => {
	it("returns ok status", () => {
		const { stdout, exitCode } = run("health");
		expect(exitCode).toBe(0);
		expect(stdout).toContain("Status: ok");
	});

	it("returns JSON when --json flag set", () => {
		const { stdout, exitCode } = run("health --json");
		expect(exitCode).toBe(0);
		const parsed = JSON.parse(stdout);
		expect(parsed.status).toBe("ok");
	});
});

// --- Authenticated endpoints ---
// These require a valid LIMINALDB_API_KEY pointing at a real environment.
// Skip if no key is configured (CI without secrets, local without setup).

const hasAuth = API_KEY !== "test-integration-key";
const authDescribe = hasAuth ? describe : describe.skip;

authDescribe("authenticated endpoints", () => {
	const testSlug = `cli-integration-test-${Date.now()}`;

	// --- Whoami ---

	it("whoami returns user info", () => {
		const { stdout, exitCode } = run("whoami --json");
		expect(exitCode).toBe(0);
		const parsed = JSON.parse(stdout);
		expect(parsed.user.id).toBeDefined();
	});

	// --- Prompts CRUD round trip ---

	it("save → get → update → use → delete round trip", () => {
		// Save
		const saveResult = run(
			`prompts save --slug ${testSlug} --name "Integration Test" --content "Test content" --tags code --json`,
		);
		expect(saveResult.exitCode).toBe(0);
		const saved = JSON.parse(saveResult.stdout);
		expect(saved.ids).toBeDefined();

		// Get
		const getResult = run(`prompts get ${testSlug} --json`);
		expect(getResult.exitCode).toBe(0);
		const got = JSON.parse(getResult.stdout);
		expect(got.slug).toBe(testSlug);
		expect(got.name).toBe("Integration Test");

		// Update
		const updateResult = run(
			`prompts update ${testSlug} --name "Updated Name" --json`,
		);
		expect(updateResult.exitCode).toBe(0);

		// Use (track usage)
		const useResult = run(`prompts use ${testSlug} --json`);
		expect(useResult.exitCode).toBe(0);

		// Delete (cleanup)
		const deleteResult = run(`prompts delete ${testSlug} --json`);
		expect(deleteResult.exitCode).toBe(0);
	});

	// --- Prompts List ---

	it("prompts list returns array", () => {
		const { stdout, exitCode } = run("prompts list --json");
		expect(exitCode).toBe(0);
		const parsed = JSON.parse(stdout);
		expect(Array.isArray(parsed)).toBe(true);
	});

	// --- Prompts Search ---

	it("prompts search returns array", () => {
		const { stdout, exitCode } = run('prompts search "test" --json');
		expect(exitCode).toBe(0);
		const parsed = JSON.parse(stdout);
		expect(Array.isArray(parsed)).toBe(true);
	});

	// --- Tags ---

	it("tags list returns object", () => {
		const { stdout, exitCode } = run("tags list --json");
		expect(exitCode).toBe(0);
		const parsed = JSON.parse(stdout);
		expect(typeof parsed).toBe("object");
	});

	// --- Preferences ---

	it("prefs get returns theme", () => {
		const { stdout, exitCode } = run("prefs get --json");
		expect(exitCode).toBe(0);
		const parsed = JSON.parse(stdout);
		expect(parsed).toHaveProperty("theme");
	});

	// --- Export ---

	it("prompts export returns YAML", () => {
		const { stdout, exitCode } = run("prompts export");
		expect(exitCode).toBe(0);
		// YAML output should be non-empty
		expect(stdout.length).toBeGreaterThan(0);
	});
});

// Cleanup guard — if the test slug somehow survived, delete it
afterAll(() => {
	if (!hasAuth) return;
	try {
		run(`prompts delete cli-integration-test-*`);
	} catch {
		// best effort cleanup
	}
});
