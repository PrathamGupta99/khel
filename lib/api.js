// lib/api.js
import Router from "next/router";

export async function apiFetch(input, init = {}) {
  // Inject JWT
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 || res.status === 404) {
    // clear bad token
    if (typeof window !== "undefined") localStorage.removeItem("token");
    Router.replace("/login");
    return null; // caller should bail
  }

  return res;
}
