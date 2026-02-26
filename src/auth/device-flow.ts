import { type StoredTokens, saveTokens } from "./token-store.js";

const WORKOS_DEVICE_AUTH_URL =
	"https://api.workos.com/user_management/authorize/device";
const WORKOS_TOKEN_URL = "https://api.workos.com/user_management/authenticate";

export interface DeviceCodeResponse {
	device_code: string;
	user_code: string;
	verification_uri: string;
	verification_uri_complete: string;
	expires_in: number;
	interval: number;
}

interface TokenResponse {
	access_token: string;
	refresh_token?: string;
	expires_in?: number;
	user?: { id: string; email?: string };
}

interface PendingResponse {
	error: string;
	error_description?: string;
}

export async function requestDeviceCode(
	clientId: string,
): Promise<DeviceCodeResponse> {
	const response = await fetch(WORKOS_DEVICE_AUTH_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({ client_id: clientId }),
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`Device authorization failed (${response.status}): ${body}`,
		);
	}

	return (await response.json()) as DeviceCodeResponse;
}

export async function pollForToken(
	clientId: string,
	deviceCode: string,
	interval: number,
	expiresIn: number,
): Promise<StoredTokens> {
	const deadline = Date.now() + expiresIn * 1000;
	const pollInterval = Math.max(interval, 5) * 1000;

	while (Date.now() < deadline) {
		await sleep(pollInterval);

		const response = await fetch(WORKOS_TOKEN_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				grant_type: "urn:ietf:params:oauth:grant-type:device_code",
				device_code: deviceCode,
				client_id: clientId,
			}),
		});

		if (response.ok) {
			const data = (await response.json()) as TokenResponse;
			const tokens: StoredTokens = {
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
				expiresAt: data.expires_in
					? Date.now() + data.expires_in * 1000
					: undefined,
			};
			saveTokens(tokens);
			return tokens;
		}

		const errorBody = (await response.json()) as PendingResponse;
		if (errorBody.error === "authorization_pending") {
			continue;
		}
		if (errorBody.error === "slow_down") {
			await sleep(5000);
			continue;
		}

		throw new Error(
			`Authentication failed: ${errorBody.error_description ?? errorBody.error}`,
		);
	}

	throw new Error("Device authorization timed out. Please try again.");
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
