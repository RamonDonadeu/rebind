"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient, refreshAccessToken } from "@/lib/api-client";
import { getAccessToken, setAccessToken } from "@/lib/auth";

export type AuthUser = {
  id: string;
  email: string;
  planTier: string;
  subscriptionStatus: string;
  limits?: {
    maxBinders: number;
    currentBinders: number;
  };
};

type AuthResponse = {
  user: Omit<AuthUser, "limits">;
  accessToken: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchCurrentUser(): Promise<AuthUser> {
  return apiClient.get<AuthUser>("/auth/me");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const me = await fetchCurrentUser();
    setUser(me);
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      let token = getAccessToken();

      if (!token) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          setUser(null);
          return;
        }
        token = getAccessToken();
      }

      if (!token) {
        setUser(null);
        return;
      }

      await refreshUser();
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiClient.post<AuthResponse>("/auth/login", { email, password });
      setAccessToken(data.accessToken);
      await refreshUser();
      router.replace("/binders");
    },
    [refreshUser, router]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const data = await apiClient.post<AuthResponse>("/auth/register", { email, password });
      setAccessToken(data.accessToken);
      await refreshUser();
      router.replace("/binders");
    },
    [refreshUser, router]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Clear local session even if the API call fails.
    }

    setAccessToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
