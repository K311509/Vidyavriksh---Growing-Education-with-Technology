/**
 * HighRiskStudents.jsx
 *
 * Teacher dashboard panel — shows students whose ML dropout risk is HIGH.
 * Batch-predicts via Flask ML service on mount, then merges results into
 * the student list coming from Spring Boot.
 *
 * Props:
 *   students  {object[]}  - student list from Spring Boot /api/students
 */

import React, { useEffect, useState } from "react";
import { AlertTriangle, TrendingDown, Phone, Mail, Loader2 } from "lucide-react";
import { batchPredictDropoutRisk } from "../../services/mlService"; // ← adjust path if needed

const HighRiskStudents = ({ students = [] }) => {
  const [enriched, setEnriched] = useState([]);
  const [loading,  setLoading]  = useState(false);

  // ── Run batch ML prediction whenever students list changes ─────────────────
  useEffect(() => {
    if (!students.length) { setEnriched([]); return; }

    let cancelled = false;
    setLoading(true);

    batchPredictDropoutRisk(students).then((predictions) => {
      if (cancelled) return;

      // Build a lookup map: studentId → ML result
      const mlMap = {};
      for (const p of predictions) {
        mlMap[p.studentId] = p;
      }

      // Merge ML predictions into each student object
      const merged = students
        .map((s) => {
          const sid = s.studentId || s.id;
          const ml  = mlMap[sid] ?? {};
          return {
            ...s,
            // Prefer ML values; fall back to whatever Spring Boot sent
            dropoutRiskScore: (ml.riskScore ?? (s.dropoutRiskScore ?? 0) * 100) / 100,
            riskLevel:        ml.riskLevel  ?? s.riskLevel  ?? "LOW",
            riskFactors:      ml.riskFactors ?? s.riskFactors ?? [],
          };
        })
        // Only show HIGH risk students
        .filter((s) => s.riskLevel === "HIGH")
        // Sort by risk descending
        .sort((a, b) => b.dropoutRiskScore - a.dropoutRiskScore);

      setEnriched(merged);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [students]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-red-400" />
        <p className="text-gray-500 text-sm">Running ML dropout analysis…</p>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!enriched.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No High-Risk Students</h3>
        <p className="text-gray-500">All students are performing well! 🎉</p>
      </div>
    );
  }

  // ── Main list ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingDown className="w-6 h-6 text-red-500" />
        High Risk Students ({enriched.length})
      </h3>

      <div className="space-y-4">
        {enriched.map((student) => {
          const riskPct = ((student.dropoutRiskScore ?? 0) * 100).toFixed(0);
          const attendance = Number(student.attendancePercentage ?? 0).toFixed(1);
          const gpa        = student.currentGPA?.toFixed(2) ?? "N/A";
          const absences   = student.totalAbsent ?? 0;

          return (
            <div
              key={student.id ?? student.studentId}
              className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg hover:shadow-md transition"
            >
              {/* ── Header row ── */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">
                    {student.user?.fullName ?? student.fullName ?? "Unknown"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {student.studentId} • Class {student.classGrade}-{student.section}
                  </p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                  {riskPct}% Risk
                </span>
              </div>

              {/* ── 3 metrics grid (matching StudentRisk metrics) ── */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600">Attendance</p>
                  <p className="text-lg font-bold text-gray-800">{attendance}%</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600">GPA</p>
                  <p className="text-lg font-bold text-gray-800">{gpa}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600">Absences</p>
                  <p className="text-lg font-bold text-gray-800">{absences}</p>
                </div>
              </div>

              {/* ── Risk factors from ML ── */}
              {student.riskFactors?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Risk Factors:</p>
                  <div className="flex flex-wrap gap-1">
                    {student.riskFactors.map((factor, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Guardian contact ── */}
              <div className="flex gap-2 text-sm">
                <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">
                  <Phone className="w-3 h-3" />
                  <span>Call Guardian</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                  <Mail className="w-3 h-3" />
                  <span>Email Guardian</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HighRiskStudents;