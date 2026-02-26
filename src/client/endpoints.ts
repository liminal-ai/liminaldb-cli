export const endpoints = {
	// Health
	health: "/health",
	healthAuth: "/api/health",

	// Auth
	whoami: "/auth/me",

	// Prompts
	prompts: "/api/prompts",
	promptBySlug: (slug: string) => `/api/prompts/${encodeURIComponent(slug)}`,
	promptFlags: (slug: string) =>
		`/api/prompts/${encodeURIComponent(slug)}/flags`,
	promptUsage: (slug: string) =>
		`/api/prompts/${encodeURIComponent(slug)}/usage`,
	promptTags: "/api/prompts/tags",

	// Import/Export
	promptsExport: "/api/prompts/export",
	promptsImportPreview: "/api/prompts/import/preview",
	promptsImport: "/api/prompts/import",

	// Preferences
	preferences: "/api/preferences",
} as const;
