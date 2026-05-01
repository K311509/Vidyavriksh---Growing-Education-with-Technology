/**
 * StudentRisk.jsx
 *
 * Shows a student's dropout risk powered by the Flask ML model.
 * Risk is fetched from Flask :5000 via mlService.js — NOT hardcoded.
 *
 * Props:
 *   student  {object}  - student object from Spring Boot (must have
 *                        attendancePercentage, currentGPA/gpa, engagement,
 *                        totalAbsent/absences, behavioralIssues)
 */

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { predictDropoutRisk } from "../../services/mlService"; // ← adjust path if needed

// ── Styling maps ─────────────────────────────────────────────────────────────
const RISK_CLS = {
  LOW:    "bg-green-100  text-green-800  border-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
  HIGH:   "bg-red-100    text-red-800    border-red-300",
};
const RISK_BAR = {
  LOW:    "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH:   "bg-red-500",
};

// ── Bar colour by value ───────────────────────────────────────────────────────
function barColor(v) {
  return v >= 75 ? "bg-green-500" : v >= 50 ? "bg-yellow-500" : "bg-red-500";
}
function textColor(v) {
  return v >= 75 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-600";
}

// ────────────────────────────────────────────────────────────────────────────
const StudentRisk = ({ student }) => {
  const [risk,    setRisk]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [mlError, setMlError] = useState(null);

  // ── Fetch ML prediction whenever student changes ──────────────────────────
  useEffect(() => {
    if (!student) return;

    let cancelled = false;
    setLoading(true);
    setMlError(null);

    predictDropoutRisk(student).then((result) => {
      if (cancelled) return;
      if (result.error) setMlError(result.error);
      setRisk(result);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [student?.studentId ?? student?.id]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!student) {
    return <div className="text-center py-12 text-gray-400">Loading…</div>;
  }

  // ── Derive display values ─────────────────────────────────────────────────
  const level = risk?.riskLevel ?? "LOW";
  const score = risk?.riskScore ?? 0;   // already 0-100

  // The 3 metrics shown in the UI:
  //   attendance  → raw percentage (0-100)
  //   GPA × 10    → stored as 0-10, multiply for display
  //   engagement  → raw percentage (0-100)
  const attendance = Number(student.attendancePercentage ?? student.attendance ?? 0);
  const gpaDisplay = Number(student.currentGPA ?? student.gpa ?? 0) * 10;
  const engagement = Number(student.engagement ?? student.participationScore ?? 0);

  const metrics = [
    { label: "Attendance", value: attendance, hint: "Aim for 75%+" },
    { label: "GPA (×10)",  value: gpaDisplay,  hint: "Aim for 70+"  },
    { label: "Engagement", value: engagement,  hint: "Stay engaged!" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── ML error banner (non-blocking) ── */}
      {mlError && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl px-4 py-2 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          ML service unavailable — showing last known data. ({mlError})
        </div>
      )}

      {/* ── Header / risk score card ── */}
      <div className={`rounded-2xl border-2 p-8 ${RISK_CLS[level] ?? RISK_CLS.LOW}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Dropout Risk</h2>
            <p className="text-gray-600 text-sm mt-1">
              Based on attendance, grades &amp; engagement
            </p>
          </div>
          {level === "LOW"
            ? <TrendingUp  className="w-12 h-12 text-green-600" />
            : <TrendingDown className="w-12 h-12 text-red-600"  />}
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
          ) : (
            <span className="text-5xl font-black text-gray-800">{score}</span>
          )}
          <div>
            <p className="text-sm text-gray-600">Risk Score</p>
            <span className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${RISK_CLS[level]}`}>
              {level} RISK
            </span>
          </div>
        </div>

        {/* Score progress bar */}
        <div className="mt-4 bg-white/50 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full ${RISK_BAR[level]} transition-all duration-700`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* ── 3 Metrics ── */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Your Metrics</h3>
        {metrics.map(({ label, value, hint }) => (
          <div key={label} className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-gray-700">{label}</span>
              <span className={`font-bold ${textColor(value)}`}>
                {Math.round(value)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor(value)} transition-all duration-500`}
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{hint}</p>
          </div>
        ))}
      </div>

      {/* ── Risk Factors (from ML model) ── */}
      {risk?.riskFactors?.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Factors
          </h3>
          {risk.riskFactors.map((f, i) => (
            <p key={i} className="text-sm text-red-700 flex gap-2 mb-1">
              <span>•</span>{f}
            </p>
          ))}
        </div>
      )}

      {/* ── Recommendations (from ML model) ── */}
      {risk?.recommendations?.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Recommendations
          </h3>
          {risk.recommendations.map((r, i) => (
            <p key={i} className="text-sm text-green-700 flex gap-2 mb-1">
              <span>✓</span>{r}
            </p>
          ))}
        </div>
      )}

      {/* ── Badges ── */}
      {student.badges?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">Your Badges 🏅</h3>
          <div className="flex flex-wrap gap-2">
            {student.badges.map((b, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 rounded-xl text-sm font-semibold"
              >
                🏅 {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRisk;