export class LiminalError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = "LiminalError";
	}
}

export class AuthenticationError extends LiminalError {
	constructor(message: string) {
		super(message, "AUTH_FAILED");
		this.name = "AuthenticationError";
	}
}

export class NotAuthenticatedError extends LiminalError {
	constructor() {
		super(
			'Not authenticated. Run "liminaldb login" or set LIMINALDB_API_KEY.',
			"NOT_AUTHENTICATED",
		);
		this.name = "NotAuthenticatedError";
	}
}

export class ApiRequestError extends LiminalError {
	constructor(
		public readonly status: number,
		message: string,
		public readonly serverCode?: string,
	) {
		super(message, "API_ERROR");
		this.name = "ApiRequestError";
	}
}

export class PromptNotFoundError extends LiminalError {
	constructor(slug: string) {
		super(`Prompt not found: ${slug}`, "PROMPT_NOT_FOUND");
		this.name = "PromptNotFoundError";
	}
}

export class DuplicateSlugError extends LiminalError {
	constructor(slug: string) {
		super(`Slug already exists: ${slug}`, "DUPLICATE_SLUG");
		this.name = "DuplicateSlugError";
	}
}

export class ValidationError extends LiminalError {
	constructor(message: string) {
		super(message, "VALIDATION_ERROR");
		this.name = "ValidationError";
	}
}

export class ConfigurationError extends LiminalError {
	constructor(message: string) {
		super(message, "CONFIGURATION_ERROR");
		this.name = "ConfigurationError";
	}
}

export class NetworkError extends LiminalError {
	constructor(message: string) {
		super(message, "NETWORK_ERROR");
		this.name = "NetworkError";
	}
}

export function errorHint(error: LiminalError): string | undefined {
	switch (error.code) {
		case "NOT_AUTHENTICATED":
			return 'Run "liminaldb login" or set LIMINALDB_API_KEY environment variable.';
		case "PROMPT_NOT_FOUND":
			return 'Use "liminaldb prompts list" to see available prompts.';
		case "DUPLICATE_SLUG":
			return 'Use "liminaldb prompts update <slug>" to modify an existing prompt.';
		case "NETWORK_ERROR":
			return "Check your internet connection and LIMINALDB_URL setting.";
		case "CONFIGURATION_ERROR":
			return 'Check your config file or environment variables. Run "liminaldb --help" for details.';
		default:
			return undefined;
	}
}
