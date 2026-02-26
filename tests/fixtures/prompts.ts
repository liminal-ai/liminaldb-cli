import type { Prompt, PromptInput } from "../../src/types/api.js";

export const samplePrompt: Prompt = {
	slug: "test-prompt",
	name: "Test Prompt",
	description: "A prompt for testing",
	content: "You are a helpful assistant that {{task}}.",
	tags: ["code", "instruction"],
	parameters: [
		{
			name: "task",
			type: "string",
			required: true,
			description: "The task to perform",
		},
	],
	pinned: false,
	favorited: true,
	usageCount: 5,
	lastUsedAt: 1708900000000,
};

export const samplePrompt2: Prompt = {
	slug: "another-prompt",
	name: "Another Prompt",
	description: "Second test prompt",
	content: "Summarize the following text.",
	tags: ["summarize"],
	pinned: true,
	favorited: false,
	usageCount: 12,
	lastUsedAt: 1708950000000,
};

export const samplePromptInput: PromptInput = {
	slug: "new-prompt",
	name: "New Prompt",
	description: "A freshly created prompt",
	content: "Review this code for bugs.",
	tags: ["code", "review"],
};

export const samplePromptList: Prompt[] = [samplePrompt, samplePrompt2];

export const sampleTags = {
	purpose: ["instruction", "reference", "persona", "workflow", "snippet"],
	domain: [
		"code",
		"writing",
		"analysis",
		"planning",
		"design",
		"data",
		"communication",
	],
	task: [
		"review",
		"summarize",
		"explain",
		"debug",
		"transform",
		"extract",
		"translate",
	],
};

export const sampleHealth = {
	status: "ok" as const,
	timestamp: "2026-02-25T12:00:00.000Z",
	convex: "connected",
};

export const sampleHealthAuth = {
	...sampleHealth,
	user: { id: "user_01ABC", email: "test@liminal.ai" },
};

export const sampleWhoami = {
	user: { id: "user_01ABC", email: "test@liminal.ai" },
};

export const sampleExportYaml = `prompts:
  - slug: test-prompt
    name: Test Prompt
    description: A prompt for testing
    content: You are a helpful assistant.
    tags:
      - code
`;

export const sampleImportPreview = {
	total: 3,
	newSlugs: ["new-one", "new-two"],
	duplicateSlugs: ["existing"],
};

export const sampleImportResult = {
	imported: 2,
	skipped: 1,
};
