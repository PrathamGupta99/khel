// contexts/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { apiFetch } from '../lib/api.js';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) return setUser(null);

    apiFetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
