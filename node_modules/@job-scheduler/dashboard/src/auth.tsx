import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken, clearAuthToken, loadAuthToken } from "./api";

interface AuthContextValue {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadAuthToken();
    setToken(existing);
  }, []);

  const value = useMemo(
    () => ({
      token,
      login: (newToken: string) => {
        setAuthToken(newToken);
        setToken(newToken);
      },
      logout: () => {
        clearAuthToken();
        setToken(null);
      }
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
