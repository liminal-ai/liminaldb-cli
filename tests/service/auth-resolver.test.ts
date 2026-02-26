import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveToken } from "../../src/auth/auth-resolver.js";
import { NotAuthenticatedError } from "../../src/errors/errors.js";

vi.mock("../../src/auth/token-store.js", () => ({
	loadStoredTokens: vi.fn(),
}));

import { loadStoredTokens } from "../../src/auth/token-store.js";

const mockLoadTokens = vi.mocked(loadStoredTokens);

beforeEach(() => {
	vi.stubEnv("LIMINALDB_API_KEY", "");
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.clearAllMocks();
});

describe("resolveToken", () => {
	it("returns env API key when set", () => {
		vi.stubEnv("LIMINALDB_API_KEY", "env-key-123");

		const token = resolveToken();

		expect(token).toBe("env-key-123");
		expect(mockLoadTokens).not.toHaveBeenCalled();
	});

	it("returns stored token when env key not set", () => {
		mockLoadTokens.mockReturnValue({
			accessToken: "stored-token-456",
			expiresAt: Date.now() + 3600000,
		});

		const token = resolveToken();

		expect(token).toBe("stored-token-456");
	});

	it("throws NotAuthenticatedError when no token available", () => {
		mockLoadTokens.mockReturnValue(null);

		expect(() => resolveToken()).toThrow(NotAuthenticatedError);
	});

	it("throws NotAuthenticatedError when stored token is expired", () => {
		mockLoadTokens.mockReturnValue({
			accessToken: "expired-token",
			expiresAt: Date.now() - 1000,
		});

		expect(() => resolveToken()).toThrow(NotAuthenticatedError);
	});

	it("returns stored token without expiresAt (no expiration check)", () => {
		mockLoadTokens.mockReturnValue({
			accessToken: "no-expiry-token",
		});

		const token = resolveToken();

		expect(token).toBe("no-expiry-token");
	});

	it("prefers env key over stored token", () => {
		vi.stubEnv("LIMINALDB_API_KEY", "env-key");
		mockLoadTokens.mockReturnValue({ accessToken: "stored-key" });

		const token = resolveToken();

		expect(token).toBe("env-key");
	});
});
