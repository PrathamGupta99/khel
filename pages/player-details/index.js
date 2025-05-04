// pages/player-details/index.js

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../../contexts/AuthContext.js";
import { apiFetch } from "../../lib/api.js";

export default function EventsListPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/participations").then((res) => {
      if (!res) return;
      res.json().then((data) => {
        setEvents(data.sports || []);
      });
    });
  }, [user]);

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
      <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        {user?.name}
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "1.5rem",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={headerStyles}>#</th>
            <th style={headerStyles}>Sport</th>
            <th style={headerStyles}>Gender</th>
            <th style={headerStyles}>Category</th>
            <th style={headerStyles}>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td style={cellStyles}>{i + 1}</td>
              <td style={cellStyles}>{e.sport}</td>
              <td style={cellStyles}>{e.gender}</td>
              <td style={cellStyles}>{e.category}</td>
              <td style={cellStyles}>
                <button
                  onClick={() =>
                    router.push(
                      `/player-details/${e.sport}/${e.gender}/${e.category}`,
                    )
                  }
                  style={{
                    padding: "0.2rem 0.3rem",
                    borderRadius: 3,
                    cursor: "pointer",
                    font: "0.75rem",
                    border: "1px solid",
                  }}
                >
                  Fill Details
                </button>
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                No participation found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
