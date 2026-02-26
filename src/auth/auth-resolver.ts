import { NotAuthenticatedError } from "../errors/errors.js";
import { loadStoredTokens } from "./token-store.js";

export function resolveToken(): string {
	// 1. Environment variable (CI/CD, headless agents, Docker)
	const envKey = process.env.LIMINALDB_API_KEY;
	if (envKey) return envKey;

	// 2. Stored OAuth token from `liminaldb login`
	const stored = loadStoredTokens();
	if (stored) {
		// Check expiration if available
		if (stored.expiresAt && Date.now() > stored.expiresAt) {
			// TODO: auto-refresh with refresh_token when available
			throw new NotAuthenticatedError();
		}
		return stored.accessToken;
	}

	// 3. No token found
	throw new NotAuthenticatedError();
}
