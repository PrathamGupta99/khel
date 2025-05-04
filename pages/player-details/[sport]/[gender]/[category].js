// pages/player-details/[sport]/[gender]/[category].js

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../../../../contexts/AuthContext.js";
import { apiFetch } from "../../../../lib/api.js";
import { AGE_CUTOFF } from "../../../../lib/config.js";

const classes = Array.from({ length: 7 }, (_, i) => 6 + i); // 6–12

const playerLimits = {
  Kabaddi: { min: 7, max: 12 },
  "Kho-Kho": { min: 2, max: 3 },
  Volleyball: { min: 6, max: 10 },
  Chess: { min: 1, max: 3 },
  Badminton: { min: 2, max: 8 },
};

export default function FillDetailsPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { sport, gender, category } = router.query;

  const [players, setPlayers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    std: "6",
    dob: "",
    regNo: "",
  });
  const [message, setMessage] = useState("");
  const [isDraft, setIsDraft] = useState(true);

  const limits = playerLimits[sport] || { min: 1, max: 100 };
  const maxDate = new Date(AGE_CUTOFF);
  const age = Number(category?.slice(2)); // 'U-14' → 14
  const minDate = new Date(maxDate);
  minDate.setFullYear(minDate.getFullYear() - age - 1);
  minDate.setDate(minDate.getDate() + 1);

  // load existing players
  useEffect(() => {
    if (!user || !sport) return;
    apiFetch(
      `/api/player-details?sport=${encodeURIComponent(sport)}&gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(category)}`,
    ).then((res) => {
      if (!res) return;
      res.json().then((docs) => {
        if (docs.length) {
          setPlayers(docs[0].players);
          setIsDraft(docs[0]?.isDraft ?? true);
        }
      });
    });
  }, [user, sport, gender, category]);

  const handleAdd = () => {
    setFormData({ name: "", fatherName: "", std: "6", dob: "", regNo: "" });
    setEditingIndex(-1);
    setMessage("");
  };

  const handleEdit = (idx) => {
    setFormData(players[idx]);
    setEditingIndex(idx);
    setMessage("");
  };

  const handleRemove = (idx) => {
    const next = players.filter((_, i) => i !== idx);
    apiFetch("/api/player-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sport,
        gender,
        category,
        players: next,
      }),
    }).then((res) => {
      if (res?.ok) setPlayers(next);
    });
  };

  const handleChange = (field, val) => {
    setFormData({ ...formData, [field]: val });
  };

  const saveCurrent = async (exitAfter = true) => {
    const next = [...players];
    if (editingIndex === -1) next.push(formData);
    else next[editingIndex] = formData;

    // enforce max always
    if (next.length > limits.max) {
      setMessage(`Cannot exceed ${limits.max} players.`);
      return false;
    }
    // enforce min only when finishing
    if (exitAfter && next.length < limits.min) {
      setMessage(`At least ${limits.min} players required to finish.`);
      return false;
    }
    for (let p of next) {
      if (!p.name || !p.fatherName || !p.dob || !p.regNo) {
        setMessage("All fields are required.");
        return false;
      }
      const d = new Date(p.dob);
      if (d < minDate || d > maxDate) {
        setMessage(
          `DOB must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}.`,
        );
        return false;
      }
    }

    const res = await apiFetch("/api/player-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sport,
        gender,
        category,
        players: next,
        isDraft: exitAfter ? false : true,
      }),
    });
    if (!res) return false;
    if (!res.ok) {
      const err = await res.json();
      setMessage(err.error || "Save failed.");
      return false;
    }

    setPlayers(next);
    setMessage("Saved.");
    setEditingIndex(null);
    return true;
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveCurrent(true);
  };

  if (!user) return <p>Loading…</p>;

  // const cellStyles = {
  //   padding: 8,
  //   border: "1px solid #ccc",
  //   textAlign: "center",
  // };

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

  const buttonStyles = {
    padding: "0.2rem 0.3rem",
    borderRadius: 3,
    cursor: "pointer",
    font: "0.75rem",
    border: "1px solid",
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
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => router.push("/player-details")}
          style={buttonStyles}
        >
          Back to Events
        </button>
      </div>

      <h1 style={{ marginTop: "1rem" }}>
        {sport} – {gender} – {category}
      </h1>
      <p>
        <em>
          Players required: {limits.min}–{limits.max}
        </em>
      </p>

      {/* list view */}
      <table
        style={{
          width: "100%",
          border: "1px solid #ccc",
          marginBottom: "1rem",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={headerStyles}>#</th>
            <th style={headerStyles}>Name</th>
            <th style={headerStyles}>Father’s Name</th>
            <th style={headerStyles}>Std</th>
            <th style={headerStyles}>DOB</th>
            <th style={headerStyles}>Reg. No.</th>
            <th style={headerStyles}>Actions</th>
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
              <td
                style={{
                  padding: 8,
                  textAlign: "center",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => handleEdit(i)}
                  style={buttonStyles}
                  disabled={!isDraft}
                >
                  Edit
                </button>
                <button
                  disabled={!isDraft}
                  onClick={() => handleRemove(i)}
                  style={buttonStyles}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 8, textAlign: "center" }}>
                No players added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={handleAdd}
          disabled={players.length >= limits.max}
          style={buttonStyles}
        >
          + Add Player
        </button>
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to save this team sheet entry? You will not be able to change this anymore.",
              )
            ) {
              saveCurrent(true);
            }
          }}
          disabled={!isDraft || players.length < limits.min}
          style={buttonStyles}
        >
          Save All
        </button>
      </div>

      {/* form view */}
      {editingIndex !== null && (
        <form onSubmit={handleSave} style={{ marginTop: "1rem" }}>
          <fieldset style={{ padding: 16, border: "1px solid #ddd" }}>
            <legend>
              <strong>
                {editingIndex === -1
                  ? "New Player"
                  : `Edit Player ${editingIndex + 1}`}
              </strong>
            </legend>

            <label>
              Name*
              <br />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                style={{ width: "100%", marginBottom: 8, padding: 4 }}
              />
            </label>
            <br />

            <label>
              Father’s Name*
              <br />
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleChange("fatherName", e.target.value)}
                required
                style={{ width: "100%", marginBottom: 8, padding: 4 }}
              />
            </label>
            <br />

            <label>
              Class/Standard*
              <br />
              <select
                value={formData.std}
                onChange={(e) => handleChange("std", e.target.value)}
                required
                style={{ width: "100%", marginBottom: 8, padding: 4 }}
              >
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <br />

            <label>
              DOB*
              <br />
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                required
                min={minDate}
                max={maxDate}
                style={{ width: "100%", marginBottom: 8, padding: 4 }}
              />
            </label>
            <br />

            <label>
              Registration No.*
              <br />
              <input
                type="text"
                value={formData.regNo}
                onChange={(e) => handleChange("regNo", e.target.value)}
                required
                style={{ width: "100%", marginBottom: 8, padding: 4 }}
              />
            </label>
            <br />

            {message && (
              <p
                style={{
                  color: message.startsWith("Error") ? "red" : "green",
                  marginBottom: 8,
                }}
              >
                {message}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "space-between",
                marginTop: "12px",
              }}
            >
              {players.length < limits.max && (
                <button
                  type="button"
                  onClick={() => saveCurrent(false)}
                  style={buttonStyles}
                >
                  Save
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                style={buttonStyles}
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
