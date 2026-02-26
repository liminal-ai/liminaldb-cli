import type {
	HealthResponse,
	ImportPreviewResponse,
	Prompt,
	WhoamiResponse,
} from "../types/api.js";

export function formatPromptList(prompts: Prompt[], verbose: boolean): string {
	if (prompts.length === 0) return "No prompts found.";

	const lines: string[] = [`${prompts.length} prompt(s):\n`];

	for (const p of prompts) {
		if (verbose) {
			lines.push(`  ${p.slug}`);
			lines.push(`    Name: ${p.name}`);
			lines.push(`    Tags: ${p.tags.join(", ") || "(none)"}`);
			lines.push(`    Description: ${truncate(p.description, 80)}`);
			if (p.usageCount) lines.push(`    Uses: ${p.usageCount}`);
			lines.push("");
		} else {
			const tags = p.tags.length ? ` [${p.tags.join(", ")}]` : "";
			lines.push(`  ${p.slug}${tags} — ${truncate(p.description, 60)}`);
		}
	}

	return lines.join("\n");
}

export function formatPromptDetail(prompt: Prompt): string {
	const lines: string[] = [
		`Slug: ${prompt.slug}`,
		`Name: ${prompt.name}`,
		`Description: ${prompt.description}`,
		`Tags: ${prompt.tags.join(", ") || "(none)"}`,
	];

	if (prompt.pinned) lines.push("Pinned: yes");
	if (prompt.favorited) lines.push("Favorited: yes");
	if (prompt.usageCount) lines.push(`Usage count: ${prompt.usageCount}`);
	if (prompt.lastUsedAt)
		lines.push(`Last used: ${new Date(prompt.lastUsedAt).toLocaleString()}`);
	if (prompt.parameters?.length) {
		lines.push(
			`Parameters: ${prompt.parameters.map((p) => `${p.name}:${p.type}`).join(", ")}`,
		);
	}

	lines.push("", "--- Content ---", prompt.content);

	return lines.join("\n");
}

export function formatHealth(health: HealthResponse): string {
	const lines = [`Status: ${health.status}`, `Convex: ${health.convex}`];
	if (health.user) {
		lines.push(`User: ${health.user.id}`);
		if (health.user.email) lines.push(`Email: ${health.user.email}`);
	}
	return lines.join("\n");
}

export function formatWhoami(data: WhoamiResponse): string {
	const lines = [`User ID: ${data.user.id}`];
	if (data.user.email) lines.push(`Email: ${data.user.email}`);
	return lines.join("\n");
}

export function formatTags(tags: Record<string, string[]>): string {
	const lines: string[] = [];
	for (const [dimension, names] of Object.entries(tags)) {
		lines.push(`${dimension}: ${names.join(", ")}`);
	}
	return lines.join("\n");
}

export function formatImportPreview(preview: ImportPreviewResponse): string {
	const lines = [
		`Total prompts in file: ${preview.total}`,
		`New (will import): ${preview.newSlugs.length}`,
		`Duplicates (will skip): ${preview.duplicateSlugs.length}`,
	];
	if (preview.newSlugs.length > 0) {
		lines.push("", "New slugs:", ...preview.newSlugs.map((s) => `  ${s}`));
	}
	if (preview.duplicateSlugs.length > 0) {
		lines.push(
			"",
			"Duplicate slugs:",
			...preview.duplicateSlugs.map((s) => `  ${s}`),
		);
	}
	return lines.join("\n");
}

export function formatSaveResult(ids: string[]): string {
	return `Saved ${ids.length} prompt(s).`;
}

export function formatDeleteResult(slug: string): string {
	return `Deleted prompt: ${slug}`;
}

export function formatUpdateResult(prompt: Prompt): string {
	return `Updated prompt: ${prompt.slug}`;
}

export function formatUsageTracked(slug: string): string {
	return `Usage tracked for: ${slug}`;
}

export function formatPreference(theme: string): string {
	return `Theme: ${theme}`;
}

function truncate(str: string, max: number): string {
	if (str.length <= max) return str;
	return `${str.slice(0, max - 3)}...`;
}
