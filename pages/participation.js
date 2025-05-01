// pages/participation.js

import { apiFetch } from '../lib/api.js';
import React, { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/AuthContext.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

export default function ParticipationPage() {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);

  // form state
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [showDownloadButtons, setShowDownloadButtons] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // ref for PDF capture
  const printRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.replace("/login");
    if (user === null) return; // still loading
    if (user.isAdmin) return router.replace("/login");

    setName(user.name);
    setDistrict(user.district);
    fetchParticipation();
  }, [user, router]);

  async function fetchParticipation() {
    try {
      const res = await apiFetch('/api/participations', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.sports) {
        setIsEdit(true);
        setSelected(
          new Set(
            data.sports.map(
              ({ sport, gender, category }) => `${sport}:${gender}:${category}`,
            ),
          ),
        );
      }
      if (data.submittedAt) {
        setSubmittedAt(new Date(data.submittedAt));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggle(key) {
    const next = new Set(selected);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    next.has(key) ? next.delete(key) : next.add(key);
    setSelected(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const sports = Array.from(selected).map((k) => {
      const [sport, gender, category] = k.split(":");
      return { sport, gender, category };
    });

    try {
      const res = await apiFetch("/api/participations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, district, sports }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Submission failed");
      }
      const saved = await res.json();
      if (saved.submittedAt) setSubmittedAt(new Date(saved.submittedAt));
      setIsEdit(true);
      setUser({ ...user, name, district });
      setMessage(
        res.status === 201
          ? "Participation submitted!"
          : "Participation updated!",
      );
      setShowDownloadButtons(true);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Download PDF, shrinking to fit a single A4 page
  const downloadPDF = async () => {
    if (!printRef.current) return;
    setIsPdfGenerating(true);

    const el = printRef.current;

    // Temporarily make it visible off-screen
    const originalStyles = {
      position: el.style.position,
      left: el.style.left,
      top: el.style.top,
      display: el.style.display,
      visibility: el.style.visibility,
    };
    Object.assign(el.style, {
      position: "absolute",
      left: "-9999px",
      top: "0",
      display: "block",
      visibility: "visible",
    });

    // Render to canvas
    const canvas = await html2canvas(el, { scale: 2 });

    // Restore styles
    Object.assign(el.style, originalStyles);

    // Convert to image
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Canvas size in points (px * 72/96)
    const canvasWidthPt = (canvas.width * 72) / 96;
    const canvasHeightPt = (canvas.height * 72) / 96;

    // Compute scale to fit both width & height
    const scale = Math.min(
      pageWidth / canvasWidthPt,
      pageHeight / canvasHeightPt,
    );

    const imgWidth = canvasWidthPt * scale;
    const imgHeight = canvasHeightPt * scale;

    // Center the image
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save("participation.pdf");

    setIsPdfGenerating(false);
  };

  if (loading || user === null) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading…</p>;
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 800,
        margin: "2rem auto",
        background: "#fff",
        color: "#000",
      }}
      ref={printRef}
    >
      <h1>Participation & School Info</h1>

      {isEdit && submittedAt && (
        <p style={{ fontStyle: "italic" }}>
          Last submitted: {submittedAt.toLocaleString()}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* School Info */}
        <fieldset style={{ marginBottom: "1.5rem" }}>
          <legend>
            <strong>Your School</strong>
          </legend>
          <div style={{ margin: "0.5rem 1rem" }}>
            <label htmlFor="schoolName">School Name</label>
            <br />
            <input
              id="schoolName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ margin: "0.5rem 1rem 1rem" }}>
            <label htmlFor="district">District</label>
            <br />
            <select
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            >
              <option value="">Select district…</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Sports Checkboxes */}
        {sportsList.map((sport) => (
          <fieldset
            key={sport}
            style={{ marginBottom: "0.5rem", padding: "0.5rem" }}
          >
            <legend>
              <strong>{sport}</strong>
            </legend>
            {genders.map((gender) => (
              <div key={gender} style={{ marginBottom: "0.35rem" }}>
                <em>{gender}:</em>
                {categories.map((category) => {
                  const key = `${sport}:${gender}:${category}`;
                  return (
                    <label key={key} style={{ marginLeft: "1rem" }}>
                      <input
                        type="checkbox"
                        checked={selected.has(key)}
                        onChange={() => toggle(key)}
                      />{" "}
                      {category}
                    </label>
                  );
                })}
              </div>
            ))}
          </fieldset>
        ))}

        {message && (
          <p
            style={{
              color: message.startsWith("Error") ? "red" : "green",
              marginBottom: "1rem",
            }}
          >
            {message}
          </p>
        )}
        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "0.5rem 1.0rem",
            fontSize: "1rem",
            marginRight: "1rem",
          }}
        >
          {isPdfGenerating
            ? ""
            : submitting
              ? isEdit
                ? "Updating…"
                : "Saving…"
              : isEdit
                ? "Update"
                : "Save"}
        </button>

        {/* PDF & Print Buttons */}
        {showDownloadButtons && (
          <>
            <button
              type="button"
              onClick={downloadPDF}
              style={{
                padding: "0.5rem 1.0rem",
                fontSize: "1rem",
                marginRight: "1rem",
              }}
            >
              {isPdfGenerating ? "" : "Download PDF"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
