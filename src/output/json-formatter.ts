export function formatJson(data: unknown): string {
	return JSON.stringify(data, null, 2);
}

export function formatJsonError(
	error: Error & { code?: string; status?: number },
): string {
	return JSON.stringify({
		error: true,
		message: error.message,
		name: error.name,
		code: error.code,
		status: error.status,
	});
}
