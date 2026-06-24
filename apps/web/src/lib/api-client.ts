import { getAccessToken, setAccessToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiClientError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function parseError(response: Response): Promise<ApiClientError> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  const message = body?.error?.message ?? response.statusText ?? "Request failed";
  return new ApiClientError(message, body?.error?.code);
}

export async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return true;
}

async function request<T>(path: string, options: RequestOptions = {}, allowRetry = true): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const isAuthPath =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh");

  if (response.status === 401 && allowRetry && !isAuthPath) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return request<T>(path, options, false);
    }

    setAccessToken(null);

    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }

    throw new ApiClientError("Session expired", "UNAUTHORIZED");
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body });
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "PATCH", body });
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "PUT", body });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};
