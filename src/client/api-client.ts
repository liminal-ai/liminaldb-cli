import { resolveToken } from "../auth/auth-resolver.js";
import {
	ApiRequestError,
	DuplicateSlugError,
	NetworkError,
	PromptNotFoundError,
} from "../errors/errors.js";
import type {
	DeletePromptResponse,
	HealthResponse,
	ImportPreviewResponse,
	ImportResponse,
	Prompt,
	PromptInput,
	PromptUpdate,
	SavePromptsResponse,
	Surface,
	ThemeId,
	UpdatePromptResponse,
	WhoamiResponse,
} from "../types/api.js";
import { endpoints } from "./endpoints.js";

export class ApiClient {
	constructor(private readonly baseUrl: string) {}

	// --- Health ---

	async health(): Promise<HealthResponse> {
		return this.get(endpoints.health, false);
	}

	async healthAuth(): Promise<HealthResponse> {
		return this.get(endpoints.healthAuth);
	}

	// --- Auth ---

	async whoami(): Promise<WhoamiResponse> {
		return this.get(endpoints.whoami);
	}

	// --- Prompts ---

	async listPrompts(options?: {
		limit?: number;
		tags?: string[];
	}): Promise<Prompt[]> {
		const params = new URLSearchParams();
		if (options?.limit) params.set("limit", String(options.limit));
		if (options?.tags?.length) params.set("tags", options.tags.join(","));
		const qs = params.toString();
		return this.get(`${endpoints.prompts}${qs ? `?${qs}` : ""}`);
	}

	async searchPrompts(
		query: string,
		options?: { tags?: string[]; limit?: number },
	): Promise<Prompt[]> {
		const params = new URLSearchParams({ q: query });
		if (options?.limit) params.set("limit", String(options.limit));
		if (options?.tags?.length) params.set("tags", options.tags.join(","));
		return this.get(`${endpoints.prompts}?${params.toString()}`);
	}

	async getPrompt(slug: string): Promise<Prompt> {
		return this.get(endpoints.promptBySlug(slug));
	}

	async savePrompts(prompts: PromptInput[]): Promise<SavePromptsResponse> {
		return this.post(endpoints.prompts, { prompts });
	}

	async updatePrompt(
		slug: string,
		updates: PromptUpdate,
	): Promise<UpdatePromptResponse> {
		return this.put(endpoints.promptBySlug(slug), updates);
	}

	async deletePrompt(slug: string): Promise<DeletePromptResponse> {
		return this.del(endpoints.promptBySlug(slug));
	}

	async updateFlags(
		slug: string,
		flags: { pinned?: boolean; favorited?: boolean },
	): Promise<void> {
		await this.patch(endpoints.promptFlags(slug), flags);
	}

	async trackUsage(slug: string): Promise<void> {
		await this.post(endpoints.promptUsage(slug), {});
	}

	// --- Tags ---

	async listTags(): Promise<Record<string, string[]>> {
		return this.get(endpoints.promptTags);
	}

	// --- Import/Export ---

	async exportPrompts(): Promise<string> {
		const res = await this.rawRequest("GET", endpoints.promptsExport);
		return res.text();
	}

	async importPreview(yaml: string): Promise<ImportPreviewResponse> {
		return this.post(endpoints.promptsImportPreview, { yaml });
	}

	async importPrompts(yaml: string, slugs?: string[]): Promise<ImportResponse> {
		return this.post(endpoints.promptsImport, { yaml, slugs });
	}

	// --- Preferences ---

	async getPreferences(surface?: Surface): Promise<{ theme: string }> {
		const params = surface ? `?surface=${surface}` : "";
		return this.get(`${endpoints.preferences}${params}`);
	}

	async setPreferences(surface: Surface, theme: ThemeId): Promise<void> {
		await this.put(endpoints.preferences, { surface, theme });
	}

	// --- HTTP primitives ---

	private async get<T>(path: string, auth = true): Promise<T> {
		const res = await this.rawRequest("GET", path, undefined, auth);
		return this.handleResponse<T>(res);
	}

	private async post<T>(path: string, body: unknown): Promise<T> {
		const res = await this.rawRequest("POST", path, body);
		return this.handleResponse<T>(res);
	}

	private async put<T>(path: string, body: unknown): Promise<T> {
		const res = await this.rawRequest("PUT", path, body);
		return this.handleResponse<T>(res);
	}

	private async patch<T>(path: string, body: unknown): Promise<T> {
		const res = await this.rawRequest("PATCH", path, body);
		return this.handleResponse<T>(res);
	}

	private async del<T>(path: string): Promise<T> {
		const res = await this.rawRequest("DELETE", path);
		return this.handleResponse<T>(res);
	}

	private async rawRequest(
		method: string,
		path: string,
		body?: unknown,
		auth = true,
	): Promise<Response> {
		const url = `${this.baseUrl}${path}`;
		const headers: Record<string, string> = {
			Accept: "application/json",
		};

		if (auth) {
			const token = resolveToken();
			headers.Authorization = `Bearer ${token}`;
		}

		if (body !== undefined) {
			headers["Content-Type"] = "application/json";
		}

		try {
			return await fetch(url, {
				method,
				headers,
				body: body !== undefined ? JSON.stringify(body) : undefined,
			});
		} catch (err) {
			throw new NetworkError(
				`Request failed: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}

	private async handleResponse<T>(res: Response): Promise<T> {
		if (res.status === 204) return undefined as T;

		const contentType = res.headers.get("content-type") ?? "";
		const isJson = contentType.includes("application/json");

		if (res.ok) {
			return isJson ? ((await res.json()) as T) : ((await res.text()) as T);
		}

		const errorBody = isJson
			? ((await res.json()) as { error?: string; code?: string })
			: { error: await res.text() };

		const message = errorBody.error ?? `HTTP ${res.status}`;

		if (res.status === 404) throw new PromptNotFoundError(message);
		if (res.status === 409) throw new DuplicateSlugError(message);

		throw new ApiRequestError(res.status, message, errorBody.code);
	}
}
