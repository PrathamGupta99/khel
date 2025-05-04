// pages/index.js

import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/AuthContext.js";
import { PARTICIPATION_CUTOFF } from "../lib/config.js";

export default function IndexPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }
    if (!user) return;
    if (user) {
      let destination = "/admin/dashboard";
      if (!user?.isAdmin) {
        const now = new Date();
        if (now < PARTICIPATION_CUTOFF) {
          destination = "/participation";
        } else {
          destination = "/player-details";
        }
      }
      router.replace(destination);
    }
  }, [user, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <p>Loading…</p>
    </div>
  );
}
