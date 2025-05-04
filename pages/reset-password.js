// pages/reset-password.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../lib/api.js";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token, kind } = router.query;

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // If token/kind not yet available, don't render form
  useEffect(() => {
    if (!token || !kind) return;
  }, [token, kind]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, kind }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg || "Reset failed");
      }
      setSuccess(true);
      // Optionally redirect to login after a delay:
      setTimeout(() => router.push("/login"), 3000);
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
      <h1 style={{ textAlign: "center" }}>Reset Password</h1>

      {!token || !kind ? (
        <p>Invalid reset link.</p>
      ) : success ? (
        <p>Password reset successful! Redirecting to login…</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
          )}

          <button type="submit" style={{ width: "100%", padding: "0.75rem" }}>
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
}
