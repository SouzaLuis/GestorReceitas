import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse, User } from "../types";

export const TOKEN_STORAGE_KEY = "gestao-receitas:token";
const USER_STORAGE_KEY = "gestao-receitas:user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (auth: AuthResponse) => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => readStoredUser());
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );

  const setSession = (auth: AuthResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, auth.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
    setTokenState(auth.token);
    setUserState(auth.user);
  };

  const setToken = (newToken: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setTokenState(newToken);
  };

  const setUser = (newUser: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setUserState(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setTokenState(null);
    setUserState(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token, setSession, setToken, setUser, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
