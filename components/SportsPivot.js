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

export function SportsPivot({ sports }) {
  // 2) Build a Set of the column‐keys actually present
  const presentCols = new Set(
    sports.map(({ category, gender }) => `${category} ${gender}`),
  );

  // 3) Filter ALL_COLUMNS to only what's present, preserving order
  const columns = ALL_COLUMNS.filter((col) => presentCols.has(col));

  // 4) Build sport → Set of its own present column‐keys
  const map = sports.reduce((acc, { sport, gender, category }) => {
    const key = `${category} ${gender}`;
    if (!acc[sport]) acc[sport] = new Set();
    acc[sport].add(key);
    return acc;
  }, {});

  // 5) Render the pivot table
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Sport</th>
          {columns.map((col) => (
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
        {Object.entries(map).map(([sport, set]) => (
          <tr key={sport}>
            <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
              {sport}
            </td>
            {columns.map((col) => (
              <td
                key={col}
                style={{
                  textAlign: "center",
                  border: "1px solid #ddd",
                  background: set.has(col) ? "#cfc" : "#f9f9f9",
                }}
              >
                {set.has(col) ? "✔" : ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
