import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));

  /* --- ログイン --- */
  const login = useCallback(async (password) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error("login failed");
    const { token } = await res.json();
    setToken(token);
    localStorage.setItem("token", token);
  }, []);

  /* --- ログアウト --- */
  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
