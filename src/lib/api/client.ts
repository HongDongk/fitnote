export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const fieldErrors: Record<string, string> = {};
    if (data?.fieldErrors && typeof data.fieldErrors === "object") {
      for (const [field, message] of Object.entries(data.fieldErrors)) {
        if (typeof message === "string") {
          fieldErrors[field] = message;
        }
      }
    }
    throw new ApiError(
      typeof data?.message === "string"
        ? data.message
        : "요청을 처리하지 못했습니다. 다시 시도해주세요.",
      response.status,
      fieldErrors,
    );
  }

  return response.json() as Promise<T>;
}
