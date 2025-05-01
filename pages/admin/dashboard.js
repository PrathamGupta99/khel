// pages/admin/dashboard.js

import { apiFetch } from '../../lib/api.js';
import { SportsPivot } from "../../components/SportsPivot.js";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../../contexts/AuthContext.js";

const sportsList = ["Kho-Kho", "Kabaddi", "Chess", "Volleyball", "Badminton"];
const genders = ["Boys", "Girls"];
const categories = ["U-14", "U-17", "U-19"];
const districts = [
  "Bulandshahr",
  "Gautam Buddh Nagar",
  "Ghaziabad",
  "Hapur",
  "Meerut",
  "Baghpat",
  "Muzaffarnagar",
  "Shamli",
  "Saharanpur",
  "Bijnor",
  "Amroha",
  "Sambhal",
  "Rampur",
  "Moradabad"
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [district, setDistrict] = useState("");
  const [sport, setSport] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect non-admins
  useEffect(() => {
    if (user === null) return; // still loading
    if (!user?.isAdmin) {
      router.replace("/login");
    }
  }, [user, router]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (district) params.append("district", district);
    if (sport) params.append("sport", sport);
    if (gender) params.append("gender", gender);
    if (category) params.append("category", category);
    return params.toString();
  };

  const loadResults = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = buildQuery();
      const res = await apiFetch(`/api/admin/participations?${qs}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg || "Failed to load");
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    const qs = buildQuery();
    const token = localStorage.getItem("token");
    try {
      const res = await apiFetch(`/api/admin/participations-export?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download");

      // Turn response into a blob and download it
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "participations.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Export failed: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "2rem auto", padding: "1rem" }}>
      <h1>Admin Dashboard</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <label>District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">All</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Sport</label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">All</option>
            {sportsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">All</option>
            {genders.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={loadResults}
          disabled={loading}
          style={{ padding: "0.5rem 1.0rem", marginRight: "1rem" }}
        >
          {loading ? "Loading…" : "Load"}
        </button>
        <button onClick={exportExcel} style={{ padding: "0.5rem 1.0rem" }}>
          Export Excel
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {!loading && !error && (
     <p style={{ margin: '1rem 0', fontWeight: 'bold' }}>
       {results.length} entr{results.length === 1 ? 'y' : 'ies'} found
     </p>
   )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
              S. No.
            </th>
            <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
              School Name
            </th>
            <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
              District
            </th>
            <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
              Sports
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((p, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                {idx + 1}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                {p.school.name}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                {p.school.district}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                <SportsPivot sports={p.sports} />
              </td>
            </tr>
          ))}
          {results.length === 0 && !loading && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
