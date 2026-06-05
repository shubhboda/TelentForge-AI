import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiPost, clearAccessToken, getAccessToken, setAccessToken } from "./api";

type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "recruiter" | "manager" | "candidate";
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type SignupPayload = {
  email: string;
  password: string;
  fullName: string;
  role?: "admin" | "recruiter" | "manager" | "candidate";
  organizationSlug?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
};

const AUTH_USER_STORAGE_KEY = "talentforge.authUser";
const REFRESH_TOKEN_STORAGE_KEY = "talentforge.refreshToken";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      return null;
    }
  });

  // Attempt silent refresh on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (user) {
        return; // Already have user
      }

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      if (!refreshToken) {
        return;
      }

      try {
        const data = await apiPost<{ refreshToken: string }, RefreshResponse>("/api/auth/refresh", {
          refreshToken,
        });
        setAccessToken(data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
      } catch {
        // Refresh failed, clear tokens
        clearAccessToken();
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      }
    };

    void restoreSession();
  }, [user]);

  const persistAuth = useCallback((response: AuthResponse) => {
    setAccessToken(response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await apiPost<LoginPayload, AuthResponse>("/api/auth/login", payload);
      persistAuth(data);
    },
    [persistAuth]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const data = await apiPost<SignupPayload, AuthResponse>("/api/auth/signup", payload);
      persistAuth(data);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    clearAccessToken();
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user && !!getAccessToken(),
      login,
      signup,
      logout,
    }),
    [user, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
