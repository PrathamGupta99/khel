// pages/login.js

import { useState, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/AuthContext.js";
import { apiFetch } from "../lib/api.js";
import Link from "next/link.js";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId, password, isAdmin }),
    });

    if (!res?.ok) {
      const { error: msg } = await res?.json();
      setError(msg || "Login failed");
      return;
    }

    const { token } = await res.json();
    // 1) Store JWT
    localStorage.setItem("token", token);

    // 2) Load user profile into context
    const meRes = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (meRes.ok) {
      const { user } = await meRes.json();
      setUser(user);
    }

    // 3) Redirect based on role
    let dest = "/admin/dashboard";
    if (!isAdmin) {
      const now = new Date();
      
      const PARTICIPATION_CUTOFF = new Date('06-01-2025')

      if (now < PARTICIPATION_CUTOFF) {
        dest = "/participation";
      } else {
        dest = "/player-details";
      }
    }
    router.push(dest);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: 4,
      }}
    >
      <h1 style={{ textAlign: "center" }}>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="loginId">Login ID</label>
          <input
            id="loginId"
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />{" "}
            Login as Admin
          </label>
        </div>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        <button type="submit" style={{ width: "100%", padding: "0.75rem" }}>
          Sign In
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
    </div>
  );
}
