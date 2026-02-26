import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/client/api-client.js";
import {
	ApiRequestError,
	DuplicateSlugError,
	NetworkError,
	NotAuthenticatedError,
	PromptNotFoundError,
} from "../../src/errors/errors.js";
import {
	sampleExportYaml,
	sampleHealth,
	sampleHealthAuth,
	sampleImportPreview,
	sampleImportResult,
	samplePrompt,
	samplePromptInput,
	samplePromptList,
	sampleTags,
	sampleWhoami,
} from "../fixtures/prompts.js";
import {
	errorResponse,
	jsonResponse,
	noContentResponse,
	textResponse,
} from "../fixtures/responses.js";

const BASE_URL = "https://test.liminaldb.com";
const TEST_TOKEN = "test-api-key-12345";

let client: ApiClient;
let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
	vi.stubEnv("LIMINALDB_API_KEY", TEST_TOKEN);
	fetchSpy = vi.fn();
	vi.stubGlobal("fetch", fetchSpy);
	client = new ApiClient(BASE_URL);
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

// --- Health ---

describe("health", () => {
	it("calls GET /health without auth", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(sampleHealth));

		const result = await client.health();

		expect(result).toEqual(sampleHealth);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/health`,
			expect.objectContaining({
				method: "GET",
				headers: expect.not.objectContaining({
					Authorization: expect.any(String),
				}),
			}),
		);
	});

	it("calls GET /api/health with auth", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(sampleHealthAuth));

		const result = await client.healthAuth();

		expect(result).toEqual(sampleHealthAuth);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/health`,
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: `Bearer ${TEST_TOKEN}`,
				}),
			}),
		);
	});
});

// --- Auth ---

describe("whoami", () => {
	it("returns authenticated user info", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(sampleWhoami));

		const result = await client.whoami();

		expect(result).toEqual(sampleWhoami);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/auth/me`,
			expect.objectContaining({
				method: "GET",
				headers: expect.objectContaining({
					Authorization: `Bearer ${TEST_TOKEN}`,
				}),
			}),
		);
	});
});

// --- Prompts List ---

describe("listPrompts", () => {
	it("lists prompts with no options", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(samplePromptList));

		const result = await client.listPrompts();

		expect(result).toEqual(samplePromptList);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts`,
			expect.objectContaining({ method: "GET" }),
		);
	});

	it("passes limit and tags as query params", async () => {
		fetchSpy.mockResolvedValue(jsonResponse([]));

		await client.listPrompts({ limit: 10, tags: ["code", "review"] });

		const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
		expect(calledUrl).toContain("limit=10");
		expect(calledUrl).toContain("tags=code%2Creview");
	});
});

// --- Prompts Search ---

describe("searchPrompts", () => {
	it("searches with query string", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(samplePromptList));

		const result = await client.searchPrompts("test query");

		expect(result).toEqual(samplePromptList);
		const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
		expect(calledUrl).toContain("q=test+query");
	});

	it("passes tags and limit to search", async () => {
		fetchSpy.mockResolvedValue(jsonResponse([]));

		await client.searchPrompts("query", { tags: ["code"], limit: 5 });

		const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
		expect(calledUrl).toContain("q=query");
		expect(calledUrl).toContain("tags=code");
		expect(calledUrl).toContain("limit=5");
	});
});

// --- Prompts Get ---

describe("getPrompt", () => {
	it("gets prompt by slug", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(samplePrompt));

		const result = await client.getPrompt("test-prompt");

		expect(result).toEqual(samplePrompt);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts/test-prompt`,
			expect.objectContaining({ method: "GET" }),
		);
	});

	it("throws PromptNotFoundError on 404", async () => {
		fetchSpy.mockResolvedValue(errorResponse("Prompt not found", 404));

		await expect(client.getPrompt("nonexistent")).rejects.toThrow(
			PromptNotFoundError,
		);
	});
});

// --- Prompts Save ---

describe("savePrompts", () => {
	it("posts prompts and returns ids", async () => {
		fetchSpy.mockResolvedValue(jsonResponse({ ids: ["id_1"] }, 201));

		const result = await client.savePrompts([samplePromptInput]);

		expect(result.ids).toEqual(["id_1"]);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ prompts: [samplePromptInput] }),
			}),
		);
	});

	it("throws DuplicateSlugError on 409", async () => {
		fetchSpy.mockResolvedValue(errorResponse("Slug already exists", 409));

		await expect(client.savePrompts([samplePromptInput])).rejects.toThrow(
			DuplicateSlugError,
		);
	});
});

// --- Prompts Update ---

describe("updatePrompt", () => {
	it("puts partial updates", async () => {
		fetchSpy.mockResolvedValue(
			jsonResponse({ updated: { ...samplePrompt, name: "New Name" } }),
		);

		const result = await client.updatePrompt("test-prompt", {
			name: "New Name",
		});

		expect(result.updated.name).toBe("New Name");
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts/test-prompt`,
			expect.objectContaining({
				method: "PUT",
				body: JSON.stringify({ name: "New Name" }),
			}),
		);
	});
});

// --- Prompts Delete ---

describe("deletePrompt", () => {
	it("deletes by slug", async () => {
		fetchSpy.mockResolvedValue(jsonResponse({ deleted: true }));

		const result = await client.deletePrompt("test-prompt");

		expect(result.deleted).toBe(true);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts/test-prompt`,
			expect.objectContaining({ method: "DELETE" }),
		);
	});

	it("throws PromptNotFoundError on 404", async () => {
		fetchSpy.mockResolvedValue(errorResponse("Not found", 404));

		await expect(client.deletePrompt("gone")).rejects.toThrow(
			PromptNotFoundError,
		);
	});
});

// --- Prompts Use (Track Usage) ---

describe("trackUsage", () => {
	it("posts usage tracking", async () => {
		fetchSpy.mockResolvedValue(noContentResponse());

		await client.trackUsage("test-prompt");

		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts/test-prompt/usage`,
			expect.objectContaining({ method: "POST" }),
		);
	});
});

// --- Prompts Flags ---

describe("updateFlags", () => {
	it("patches pin and favorite flags", async () => {
		fetchSpy.mockResolvedValue(jsonResponse({ updated: true }));

		await client.updateFlags("test-prompt", { pinned: true, favorited: false });

		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts/test-prompt/flags`,
			expect.objectContaining({
				method: "PATCH",
				body: JSON.stringify({ pinned: true, favorited: false }),
			}),
		);
	});
});

// --- Tags ---

describe("listTags", () => {
	it("returns tags grouped by dimension", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(sampleTags));

		const result = await client.listTags();

		expect(result).toEqual(sampleTags);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts/tags`,
			expect.objectContaining({ method: "GET" }),
		);
	});
});

// --- Export ---

describe("exportPrompts", () => {
	it("returns raw YAML text", async () => {
		fetchSpy.mockResolvedValue(textResponse(sampleExportYaml));

		const result = await client.exportPrompts();

		expect(result).toBe(sampleExportYaml);
	});
});

// --- Import ---

describe("importPreview", () => {
	it("previews import without applying", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(sampleImportPreview));

		const result = await client.importPreview(sampleExportYaml);

		expect(result).toEqual(sampleImportPreview);
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts/import/preview`,
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ yaml: sampleExportYaml }),
			}),
		);
	});
});

describe("importPrompts", () => {
	it("imports from YAML and returns counts", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(sampleImportResult));

		const result = await client.importPrompts(sampleExportYaml);

		expect(result).toEqual(sampleImportResult);
	});

	it("passes slug filter when provided", async () => {
		fetchSpy.mockResolvedValue(jsonResponse(sampleImportResult));

		await client.importPrompts(sampleExportYaml, ["test-prompt"]);

		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/prompts/import`,
			expect.objectContaining({
				body: JSON.stringify({
					yaml: sampleExportYaml,
					slugs: ["test-prompt"],
				}),
			}),
		);
	});
});

// --- Preferences ---

describe("getPreferences", () => {
	it("gets preferences with default surface", async () => {
		fetchSpy.mockResolvedValue(jsonResponse({ theme: "dark-1" }));

		const result = await client.getPreferences();

		expect(result.theme).toBe("dark-1");
		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/preferences`,
			expect.objectContaining({ method: "GET" }),
		);
	});

	it("passes surface as query param", async () => {
		fetchSpy.mockResolvedValue(jsonResponse({ theme: "light-2" }));

		await client.getPreferences("vscode");

		const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
		expect(calledUrl).toContain("surface=vscode");
	});
});

describe("setPreferences", () => {
	it("sets theme for surface", async () => {
		fetchSpy.mockResolvedValue(jsonResponse({ updated: true }));

		await client.setPreferences("chatgpt", "dark-2");

		expect(fetchSpy).toHaveBeenCalledWith(
			`${BASE_URL}/api/preferences`,
			expect.objectContaining({
				method: "PUT",
				body: JSON.stringify({ surface: "chatgpt", theme: "dark-2" }),
			}),
		);
	});
});

// --- Error Handling ---

describe("error handling", () => {
	it("throws NetworkError on fetch failure", async () => {
		fetchSpy.mockRejectedValue(new TypeError("fetch failed"));

		await expect(client.health()).rejects.toThrow(NetworkError);
	});

	it("throws ApiRequestError on unexpected status codes", async () => {
		fetchSpy.mockResolvedValue(errorResponse("Rate limited", 429));

		await expect(client.listPrompts()).rejects.toThrow(ApiRequestError);
	});

	it("throws NotAuthenticatedError when no token available", async () => {
		vi.stubEnv("LIMINALDB_API_KEY", "");

		const unauthClient = new ApiClient(BASE_URL);
		await expect(unauthClient.listPrompts()).rejects.toThrow(
			NotAuthenticatedError,
		);
	});

	it("handles 204 No Content responses", async () => {
		fetchSpy.mockResolvedValue(noContentResponse());

		// trackUsage returns void on 204
		await expect(client.trackUsage("test")).resolves.toBeUndefined();
	});
});
