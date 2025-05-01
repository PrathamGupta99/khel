// pages/index.js

import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/AuthContext.js";

export default function IndexPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // 1) If no token, send to login immediately
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }
    // 2) Once user is loaded, redirect based on role
    if (user) {
      const destination = user.isAdmin ? "/admin/dashboard" : "/participation";
      router.replace(destination);
    }
    // If user is still null (but token exists), we wait for AuthContext to load it
  }, [user, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <p>Loading…</p>
    </div>
  );
}
