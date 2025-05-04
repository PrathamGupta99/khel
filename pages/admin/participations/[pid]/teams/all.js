import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { apiFetch } from "../../../../../lib/api.js";

export default function TeamsListPage() {
  const router = useRouter();
  const { pid } = router.query;
  const [sports, setSports] = useState([]);
  const [school, setSchool] = useState({});

  useEffect(() => {
    if (!pid) return;
    apiFetch(`/api/admin/participations/${pid}`)
      .then((res) => {
        if (!res) return;
        return res.json();
      })
      .then((rec) => {
        setSchool(rec?.school || {});
        setSports(rec?.sports || []);
      })
      .catch((err) => {
        console.error("Error loading participation:", err);
      });
  }, [pid]);

  const headerStyles = {
    border: "1px solid #ccc",
    padding: "0.5rem",
    textAlign: "center",
  };
  const cellStyles = {
    border: "1px solid #ccc",
    padding: "0.5rem",
    textAlign: "center",
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "1rem auto",
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: 4,
        background: "#fff",
      }}
    >
      <button
        onClick={() => router.push(`/admin/dashboard`)}
        style={{
          padding: "0.3rem 0.5rem",
          marginBottom: 16,
          border: "1px solid",
          borderRadius: 3,
          cursor: "pointer",
        }}
      >
        Back to Dasboard
      </button>
      <h1 style={{ textAlign: "center" }}>Teams for Participation</h1>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
        {school?.name}
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={headerStyles}>Sport</th>
            <th style={headerStyles}>Gender</th>
            <th style={headerStyles}>Category</th>
            <th style={headerStyles}>Players</th>
          </tr>
        </thead>
        <tbody>
          {sports.map((s, i) => (
            <tr key={i}>
              <td style={cellStyles}>{s.sport}</td>
              <td style={cellStyles}>{s.gender}</td>
              <td style={cellStyles}>{s.category}</td>
              <td style={cellStyles}>
                <button
                  onClick={() =>
                    router.push(
                      `/admin/participations/${pid}/teams/${encodeURIComponent(s.sport)}/${encodeURIComponent(s.gender)}/${encodeURIComponent(s.category)}`,
                    )
                  }
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid",
                    borderRadius: 3,
                    cursor: "pointer",
                  }}
                >
                  View Players
                </button>
              </td>
            </tr>
          ))}
          {sports.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 16, textAlign: "center" }}>
                No teams found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
