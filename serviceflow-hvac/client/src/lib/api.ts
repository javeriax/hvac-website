const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Thin fetch wrapper for the Express API. Throws with the server's error
 * message (if any) so form components can show it directly.
 */
export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }

  return body as T;
}

/** Same as apiFetch but for multipart/form-data uploads (no Content-Type override). */
export async function apiUpload<T = unknown>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }

  return body as T;
}
