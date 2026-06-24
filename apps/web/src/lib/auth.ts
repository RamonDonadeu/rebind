const ACCESS_TOKEN_KEY = "rebind_access_token";

let memoryToken: string | null = null;

export function getAccessToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  memoryToken = token;

  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}
