// components/SportsPivot.js
import React from "react";

// 1) Master list of all columns, in the order you'd like them
const ALL_COLUMNS = [
  "U-14 Boys",
  "U-17 Boys",
  "U-19 Boys",
  "U-14 Girls",
  "U-17 Girls",
  "U-19 Girls",
];

// 2) Master list of all sports (rows)
const ALL_SPORTS = ["Kho-Kho", "Kabaddi", "Chess", "Volleyball", "Badminton"];
export function SportsPivot({ sports }) {
  // Build a map: sport → Set of its present column‐keys
  const map = sports.reduce((acc, { sport, gender, category }) => {
    const key = `${category} ${gender}`;
    if (!acc[sport]) acc[sport] = new Set();
    acc[sport].add(key);
    return acc;
  }, {});

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Sport</th>
          {ALL_COLUMNS.map((col) => (
            <th
              key={col}
              style={{ border: "1px solid #ddd", padding: "0.5rem" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ALL_SPORTS.map((sport) => {
          const set = map[sport] || new Set();
          return (
            <tr key={sport}>
              <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                {sport}
              </td>
              {ALL_COLUMNS.map((col) => (
                <td
                  key={col}
                  style={{
                    textAlign: "center",
                    border: "1px solid #ddd",
                    padding: "0.5rem",
                    background: set.has(col) ? "#c8e6c9" : "#f9f9f9",
                  }}
                >
                  {set.has(col) && (
                    <span style={{ color: "green", fontSize: "1.2rem" }}>
                      ✔
                    </span>
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
