import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react';
import { checkToken, login } from '../service/auth';
import { App } from 'antd';

export type AuthState = "idle" | "loggedin" | "loggedout";
interface AuthContext {
  token: string;
  state: AuthState;
  login: (password: string) => Promise<void>;
}

const tokenKey = "tokenapi";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(localStorage.getItem(tokenKey) ?? "");
  const [state, setState] = useState<AuthState>("loggedin");
  const { notification } = App.useApp();

  useEffect(() => {
    if (!token) {
      setState("loggedout");
      return;
    }

    checkToken(token)
    .then(isValid => {
      if (isValid) {
        setState("loggedin");
      } else {
        setState("loggedout");
        localStorage.removeItem(tokenKey);
      }
    })
    .catch(() => {
      setState("loggedout");
      localStorage.removeItem(tokenKey);
      setToken("");
    });
  }, []);

  const ctx: AuthContext = {
    token,
    state,
    login: async (password: string) => {
      try {
        const newToken = await login(password);
        localStorage.setItem(tokenKey, newToken);
        setToken(newToken);
        setState("loggedin");
      } catch (error) {
        localStorage.removeItem(tokenKey);
        setToken("");
        setState("loggedout");
        notification.error({
          message: "Login Gagal",
          description: `Error: ${error}`,
          duration: 5,
        });
      }
    },
  }

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

export const AuthContext = createContext<AuthContext | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth not used in AuthProvider");
  }
  return context;
}

export default useAuth;