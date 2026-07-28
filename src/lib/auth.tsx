import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, getStoredToken, getStoredUser, onUnauthorized, setStoredToken, setStoredUser } from "./api";
import type { PublicUser } from "./api-types";

interface AuthContextValue {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<PublicUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()));

  const logout = useCallback(() => {
    setStoredToken(null);
    setStoredUser(null);
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const refresh = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.auth.me();
      setUser(data.user);
      setStoredUser(data.user);
      setToken(currentToken);
    } catch {
      // 401 handled globally
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const off = onUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
    return off;
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    setStoredToken(data.token);
    setStoredUser(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refresh,
    }),
    [user, token, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
