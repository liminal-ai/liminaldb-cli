import { defineCommand } from "citty";
import { pollForToken, requestDeviceCode } from "../auth/device-flow.js";

const DEFAULT_CLIENT_ID = process.env.WORKOS_CLIENT_ID ?? "";

export const loginCommand = defineCommand({
	meta: {
		name: "login",
		description: "Authenticate via OAuth device flow (opens browser)",
	},
	args: {
		clientId: {
			type: "string",
			description: "WorkOS client ID (default: from WORKOS_CLIENT_ID env)",
		},
	},
	async run({ args }) {
		const clientId = args.clientId ?? DEFAULT_CLIENT_ID;
		if (!clientId) {
			console.error(
				"Error: No WorkOS client ID. Set WORKOS_CLIENT_ID or pass --client-id.",
			);
			process.exit(1);
		}

		console.log("Requesting device authorization...");
		const device = await requestDeviceCode(clientId);

		console.log(
			`\nOpen this URL in your browser:\n  ${device.verification_uri_complete}\n`,
		);
		console.log(
			`Or go to ${device.verification_uri} and enter code: ${device.user_code}\n`,
		);
		console.log("Waiting for authentication...");

		// Attempt to open browser automatically
		try {
			const { exec } = await import("node:child_process");
			const cmd =
				process.platform === "darwin"
					? "open"
					: process.platform === "win32"
						? "start"
						: "xdg-open";
			exec(`${cmd} "${device.verification_uri_complete}"`);
		} catch {
			// Browser open is best-effort
		}

		await pollForToken(
			clientId,
			device.device_code,
			device.interval,
			device.expires_in,
		);
		console.log("Authenticated successfully.");
	},
});
