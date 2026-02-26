// SDK exports — for programmatic use

// Auth
export { resolveToken } from "./auth/auth-resolver.js";
export { pollForToken, requestDeviceCode } from "./auth/device-flow.js";
export {
	clearTokens,
	loadStoredTokens,
	saveTokens,
} from "./auth/token-store.js";
export { ApiClient } from "./client/api-client.js";
export { endpoints } from "./client/endpoints.js";

// Config
export {
	applyCliOverrides,
	loadConfiguration,
} from "./config/configuration-loader.js";
export {
	getDefaultConfig,
	PRODUCTION_URL,
	STAGING_URL,
} from "./config/defaults.js";

// Errors
export {
	ApiRequestError,
	AuthenticationError,
	ConfigurationError,
	DuplicateSlugError,
	errorHint,
	LiminalError,
	NetworkError,
	NotAuthenticatedError,
	PromptNotFoundError,
	ValidationError,
} from "./errors/errors.js";

// Types
export type {
	ApiError,
	DeletePromptResponse,
	ExportResponse,
	HealthResponse,
	ImportPreviewResponse,
	ImportResponse,
	Prompt,
	PromptInput,
	PromptUpdate,
	SavePromptsResponse,
	Surface,
	Tag,
	ThemeId,
	UpdatePromptResponse,
	WhoamiResponse,
} from "./types/api.js";
