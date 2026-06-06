const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const ACCESS_TOKEN_STORAGE_KEY = "talentforge.accessToken";

let cachedDevApiBaseUrl: string | null = null;

function isLocalApiUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function getProductionApiBaseUrl() {
  if (!configuredApiBaseUrl || isLocalApiUrl(configuredApiBaseUrl)) {
    return "";
  }
  return configuredApiBaseUrl;
}

function getDevApiBaseUrl() {
  if (configuredApiBaseUrl && !isLocalApiUrl(configuredApiBaseUrl)) {
    return configuredApiBaseUrl;
  }
  return "http://127.0.0.1:5000";
}

function getDevApiCandidates() {
  const devApiUrl = getDevApiBaseUrl();
  const candidates = [devApiUrl, "http://127.0.0.1:5000", "http://localhost:5000"];

  if (typeof window !== "undefined") {
    candidates.unshift(window.location.origin);
  }

  return [...new Set(candidates.filter(Boolean))];
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    if (import.meta.env.DEV) {
      await resolveDevApiBaseUrl();
      return true;
    }

    const response = await fetch(`${getProductionApiBaseUrl()}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function resolveDevApiBaseUrl() {
  if (cachedDevApiBaseUrl) {
    return cachedDevApiBaseUrl;
  }

  for (const baseUrl of getDevApiCandidates()) {
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2500),
      });

      if (response.ok) {
        cachedDevApiBaseUrl = baseUrl;
        return baseUrl;
      }
    } catch {
      // Try the next candidate URL.
    }
  }

  throw new Error("Backend is not running. From the project folder run: npm run dev");
}

async function getRequestBaseUrl() {
  if (import.meta.env.DEV) {
    return resolveDevApiBaseUrl();
  }
  return getProductionApiBaseUrl();
}

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
    const baseUrl = await getRequestBaseUrl();
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      cachedDevApiBaseUrl = null;
      throw error instanceof Error
        ? error
        : new Error("Backend is not running. From the project folder run: npm run dev");
    }

    throw new Error("Unable to reach the API server. Please try again in a moment.");
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

export function getApiBaseUrl() {
  if (import.meta.env.DEV) {
    return cachedDevApiBaseUrl ?? getDevApiBaseUrl();
  }
  return getProductionApiBaseUrl();
}
