import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { apiFetch } from "../../../../../../../lib/api.js";

export default function TeamPlayersPage() {
  const router = useRouter();
  const { pid, sport, gender, category } = router.query;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!pid) return;
    apiFetch(
      `/api/admin/player-details?participationId=${pid}&sport=${sport}&gender=${gender}&category=${category}`,
    )
      .then((res) => res?.json())
      .then((data) => {
        setPlayers(data?.[0]?.players || []);
      });
  }, [pid, sport, gender, category]);

  const downloadExcel = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `/api/admin/player-details-export?participationId=${pid}&sport=${encodeURIComponent(sport)}&gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(category)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `players-${sport}-${gender}-${category}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download: " + err.message);
    }
  };

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
      <h1 style={{ textAlign: "center", marginBottom: 16 }}>
        Players: {sport} – {gender} – {category}
      </h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => router.push(`/admin/participations/${pid}/teams/all`)}
          style={{
            padding: "0.3rem 0.5rem",
            marginBottom: 16,
            border: "1px solid",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          Back to Events
        </button>
        <button
          onClick={downloadExcel}
          style={{
            padding: "0.3rem 0.5rem",
            marginBottom: 16,
            border: "1px solid",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          Download Excel
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={headerStyles}>#</th>
            <th style={headerStyles}>Name</th>
            <th style={headerStyles}>Father’s Name</th>
            <th style={headerStyles}>Class</th>
            <th style={headerStyles}>DOB</th>
            <th style={headerStyles}>Reg No</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={i}>
              <td style={cellStyles}>{i + 1}</td>
              <td style={cellStyles}>{p.name}</td>
              <td style={cellStyles}>{p.fatherName}</td>
              <td style={cellStyles}>{p.std}</td>
              <td style={cellStyles}>{new Date(p.dob).toLocaleDateString()}</td>
              <td style={cellStyles}>{p.regNo}</td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                No players found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
