import { describe, expect, it } from "vitest";
import {
	LiminalError,
	NotAuthenticatedError,
	PromptNotFoundError,
	errorHint,
} from "../../src/errors/errors.js";
import {
	formatDeleteResult,
	formatHealth,
	formatImportPreview,
	formatPreference,
	formatPromptDetail,
	formatPromptList,
	formatSaveResult,
	formatTags,
	formatUpdateResult,
	formatUsageTracked,
	formatWhoami,
} from "../../src/output/human-formatter.js";
import {
	formatJson,
	formatJsonError,
} from "../../src/output/json-formatter.js";
import {
	sampleHealth,
	sampleHealthAuth,
	sampleImportPreview,
	samplePrompt,
	samplePromptList,
	sampleTags,
	sampleWhoami,
} from "../fixtures/prompts.js";

// --- Human Formatter ---

describe("formatPromptList", () => {
	it("shows empty message when no prompts", () => {
		expect(formatPromptList([], false)).toBe("No prompts found.");
	});

	it("formats compact list", () => {
		const output = formatPromptList(samplePromptList, false);
		expect(output).toContain("2 prompt(s)");
		expect(output).toContain("test-prompt");
		expect(output).toContain("another-prompt");
	});

	it("formats verbose list with details", () => {
		const output = formatPromptList(samplePromptList, true);
		expect(output).toContain("Name: Test Prompt");
		expect(output).toContain("Tags: code, instruction");
		expect(output).toContain("Uses: 5");
	});
});

describe("formatPromptDetail", () => {
	it("includes all prompt fields", () => {
		const output = formatPromptDetail(samplePrompt);
		expect(output).toContain("Slug: test-prompt");
		expect(output).toContain("Name: Test Prompt");
		expect(output).toContain("Tags: code, instruction");
		expect(output).toContain("Favorited: yes");
		expect(output).toContain("Usage count: 5");
		expect(output).toContain("Parameters: task:string");
		expect(output).toContain("--- Content ---");
		expect(output).toContain("You are a helpful assistant");
	});
});

describe("formatHealth", () => {
	it("formats basic health", () => {
		const output = formatHealth(sampleHealth);
		expect(output).toContain("Status: ok");
		expect(output).toContain("Convex: connected");
	});

	it("includes user info when present", () => {
		const output = formatHealth(sampleHealthAuth);
		expect(output).toContain("User: user_01ABC");
		expect(output).toContain("Email: test@liminal.ai");
	});
});

describe("formatWhoami", () => {
	it("shows user id and email", () => {
		const output = formatWhoami(sampleWhoami);
		expect(output).toContain("User ID: user_01ABC");
		expect(output).toContain("Email: test@liminal.ai");
	});
});

describe("formatTags", () => {
	it("formats tags by dimension", () => {
		const output = formatTags(sampleTags);
		expect(output).toContain("purpose: instruction, reference");
		expect(output).toContain("domain: code, writing");
		expect(output).toContain("task: review, summarize");
	});
});

describe("formatImportPreview", () => {
	it("shows counts and slug lists", () => {
		const output = formatImportPreview(sampleImportPreview);
		expect(output).toContain("Total prompts in file: 3");
		expect(output).toContain("New (will import): 2");
		expect(output).toContain("Duplicates (will skip): 1");
		expect(output).toContain("new-one");
		expect(output).toContain("existing");
	});
});

describe("simple formatters", () => {
	it("formatSaveResult shows count", () => {
		expect(formatSaveResult(["a", "b"])).toBe("Saved 2 prompt(s).");
	});

	it("formatDeleteResult shows slug", () => {
		expect(formatDeleteResult("my-prompt")).toBe("Deleted prompt: my-prompt");
	});

	it("formatUpdateResult shows slug", () => {
		expect(formatUpdateResult(samplePrompt)).toBe(
			"Updated prompt: test-prompt",
		);
	});

	it("formatUsageTracked shows slug", () => {
		expect(formatUsageTracked("my-prompt")).toBe(
			"Usage tracked for: my-prompt",
		);
	});

	it("formatPreference shows theme", () => {
		expect(formatPreference("dark-1")).toBe("Theme: dark-1");
	});
});

// --- JSON Formatter ---

describe("formatJson", () => {
	it("pretty prints JSON", () => {
		const output = formatJson({ foo: "bar" });
		expect(JSON.parse(output)).toEqual({ foo: "bar" });
		expect(output).toContain("\n"); // pretty printed
	});
});

describe("formatJsonError", () => {
	it("formats error with all fields", () => {
		const error = Object.assign(new Error("bad"), {
			code: "TEST",
			status: 400,
			name: "TestError",
		});
		const output = JSON.parse(formatJsonError(error));
		expect(output.error).toBe(true);
		expect(output.message).toBe("bad");
		expect(output.name).toBe("TestError");
		expect(output.code).toBe("TEST");
	});
});

// --- Error Hints ---

describe("errorHint", () => {
	it("returns auth hint for NOT_AUTHENTICATED", () => {
		const hint = errorHint(new NotAuthenticatedError());
		expect(hint).toContain("liminaldb login");
	});

	it("returns list hint for PROMPT_NOT_FOUND", () => {
		const hint = errorHint(new PromptNotFoundError("x"));
		expect(hint).toContain("liminaldb prompts list");
	});

	it("returns undefined for unknown error codes", () => {
		expect(errorHint(new LiminalError("x", "UNKNOWN_CODE"))).toBeUndefined();
	});
});
