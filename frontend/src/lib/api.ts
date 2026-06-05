const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = configuredApiBaseUrl || (import.meta.env.DEV ? "http://localhost:5000" : "");
const ACCESS_TOKEN_STORAGE_KEY = "talentforge.accessToken";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new Error(
      import.meta.env.DEV
        ? "Unable to reach the API server. Make sure the backend is running."
        : "Unable to reach the API server. Please try again in a moment."
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload.message) {
        message = errorPayload.message;
      }
    } catch {
      // Ignore JSON parsing errors and keep the status-based message.
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export async function apiPost<TPayload, TResponse>(path: string, body: TPayload): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export { API_BASE_URL };
