// pages/forgot-password.js

import { useState } from "react";
import { apiFetch } from "../lib/api.js";

export default function ForgotPasswordPage() {
  const [loginId, setLoginId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, isAdmin }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg || "Failed to send reset link");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
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
      <h1 style={{ textAlign: "center" }}>Forgot Password</h1>

      {submitted ? (
        <p>
          If that user exists, a reset link has been sent (or logged to the
          console). Check your email or the server console.
        </p>
      ) : (
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
            <label>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />{" "}
              Forgot password for Admin
            </label>
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
          )}

          <button type="submit" style={{ width: "100%", padding: "0.75rem" }}>
            Send Reset Link
          </button>
        </form>
      )}
    </div>
  );
}
