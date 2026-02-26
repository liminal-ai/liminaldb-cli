import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "pathe";

export interface StoredTokens {
	accessToken: string;
	refreshToken?: string;
	expiresAt?: number;
}

function getTokenPath(): string {
	const dir = join(homedir(), ".config", "liminaldb");
	mkdirSync(dir, { recursive: true });
	return join(dir, "tokens.json");
}

export function loadStoredTokens(): StoredTokens | null {
	try {
		const raw = readFileSync(getTokenPath(), "utf-8");
		const data = JSON.parse(raw) as StoredTokens;
		if (!data.accessToken) return null;
		return data;
	} catch {
		return null;
	}
}

export function saveTokens(tokens: StoredTokens): void {
	writeFileSync(getTokenPath(), JSON.stringify(tokens, null, 2), {
		mode: 0o600,
	});
}

export function clearTokens(): void {
	try {
		unlinkSync(getTokenPath());
	} catch {
		// Already gone, fine
	}
}
