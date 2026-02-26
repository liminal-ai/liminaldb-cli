import { z } from "zod";

// --- Tag enum (global, matches server) ---

export const TAG_VALUES = [
	"instruction",
	"reference",
	"persona",
	"workflow",
	"snippet",
	"code",
	"writing",
	"analysis",
	"planning",
	"design",
	"data",
	"communication",
	"review",
	"summarize",
	"explain",
	"debug",
	"transform",
	"extract",
	"translate",
] as const;

export type Tag = (typeof TAG_VALUES)[number];

// --- Prompt schemas ---

export const promptParameterSchema = z.object({
	name: z.string().min(1),
	type: z.enum(["string", "string[]", "number", "boolean"]),
	required: z.boolean(),
	description: z.string().optional(),
});

export const promptSchema = z.object({
	slug: z
		.string()
		.min(1)
		.max(200)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	name: z.string().min(1).max(200),
	description: z.string().min(1).max(2000),
	content: z.string().min(1).max(100_000),
	tags: z.array(z.enum(TAG_VALUES)).max(50),
	parameters: z.array(promptParameterSchema).optional(),
	pinned: z.boolean().optional(),
	favorited: z.boolean().optional(),
	usageCount: z.number().optional(),
	lastUsedAt: z.number().optional(),
});

export type Prompt = z.infer<typeof promptSchema>;

export const promptInputSchema = promptSchema.omit({
	pinned: true,
	favorited: true,
	usageCount: true,
	lastUsedAt: true,
});

export type PromptInput = z.infer<typeof promptInputSchema>;

export const promptUpdateSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	description: z.string().min(1).max(2000).optional(),
	content: z.string().min(1).max(100_000).optional(),
	tags: z.array(z.enum(TAG_VALUES)).max(50).optional(),
	pinned: z.boolean().optional(),
	favorited: z.boolean().optional(),
});

export type PromptUpdate = z.infer<typeof promptUpdateSchema>;

// --- API response shapes ---

export interface ApiError {
	error: string;
	code?: string;
}

export interface HealthResponse {
	status: "ok" | "unhealthy";
	timestamp: string;
	convex: string;
	user?: { id: string; email?: string };
}

export interface SavePromptsResponse {
	ids: string[];
}

export interface UpdatePromptResponse {
	updated: Prompt;
}

export interface DeletePromptResponse {
	deleted: boolean;
}

export interface FlagsUpdateResponse {
	updated: boolean;
}

export interface PreferenceResponse {
	theme: string;
}

export interface ExportResponse {
	yaml: string;
}

export interface ImportPreviewResponse {
	total: number;
	newSlugs: string[];
	duplicateSlugs: string[];
}

export interface ImportResponse {
	imported: number;
	skipped: number;
}

export interface WhoamiResponse {
	user: {
		id: string;
		email?: string;
		sessionId?: string;
	};
}

export type Surface = "webapp" | "chatgpt" | "vscode";
export type ThemeId =
	| "light-1"
	| "light-2"
	| "light-3"
	| "dark-1"
	| "dark-2"
	| "dark-3";
