import { defineCommand } from "citty";
import { clearTokens } from "../auth/token-store.js";

export const logoutCommand = defineCommand({
	meta: {
		name: "logout",
		description: "Clear stored authentication credentials",
	},
	run() {
		clearTokens();
		console.log("Logged out. Stored tokens cleared.");
	},
});
