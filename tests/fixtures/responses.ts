export function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

export function textResponse(body: string, status = 200): Response {
	return new Response(body, {
		status,
		headers: { "Content-Type": "text/plain" },
	});
}

export function errorResponse(
	message: string,
	status: number,
	code?: string,
): Response {
	return jsonResponse({ error: message, ...(code && { code }) }, status);
}

export function noContentResponse(): Response {
	return new Response(null, { status: 204 });
}
