/**
 * mlService.js
 * Calls the Flask ML service (port 5000) directly from the frontend.
 *
 * Place this file at:  src/services/mlService.js
 *
 * HOW IT WORKS:
 *  - Your main api.js talks to Spring Boot on :8080
 *  - This file talks to Flask ML on :5000  (separate service)
 *  - StudentRisk.jsx and HighRiskStudents.jsx import predictDropoutRisk()
 */

const ML_BASE_URL = "http://localhost:5000";

/**
 * Map student object (from Spring Boot / your DB) → Flask /predict/dropout shape.
 *
 * UI shows 3 metrics:
 *   attendance  → attendancePercentage  (already 0-100)
 *   GPA × 10    → gpa                  (stored as 0-10, UI multiplies ×10 for display)
 *   engagement  → participationScore   (stored 0-100, Flask needs 0.0-1.0)
 *
 * Additional fields the model needs (not shown in UI but present in student object):
 *   absences        → totalAbsent || absences || 0
 *   behavioralIssues → behavioralIssues || 0
 */
function buildPayload(student) {
  return {
    studentId: student.studentId || student.id,

    // ── 3 metrics shown on dashboard ────────────────────────────────────────
    attendancePercentage: Number(student.attendancePercentage ?? student.attendance ?? 0),
    gpa:                  Number(student.currentGPA ?? student.gpa ?? 0),          // 0-10 scale
    participationScore:   Number(student.engagement ?? student.participationScore ?? 50) / 100, // 0-100 → 0.0-1.0

    // ── Extra fields the model also uses ────────────────────────────────────
    absences:        Number(student.totalAbsent ?? student.absences ?? 0),
    behavioralIssues: Number(student.behavioralIssues ?? 0),
  };
}

/**
 * Predict dropout risk for a single student.
 * @param {object} student  - student object from your Spring Boot API
 * @returns {Promise<{riskScore, riskLevel, riskFactors, recommendations}>}
 */
export async function predictDropoutRisk(student) {
  try {
    const payload = buildPayload(student);

    const res = await fetch(`${ML_BASE_URL}/predict/dropout`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `ML service error: ${res.status}`);
    }

    const data = await res.json();

    // Normalise riskScore to 0-100 for the progress bar in StudentRisk.jsx
    return {
      ...data,
      riskScore: Math.round(data.riskScore * 100), // 0.0-1.0 → 0-100
    };
  } catch (error) {
    console.error("[mlService] predictDropoutRisk failed:", error.message);
    // Return a safe fallback so the UI never crashes
    return {
      studentId:       student.studentId || student.id,
      riskScore:       0,
      riskLevel:       "LOW",
      riskFactors:     [],
      recommendations: [],
      error:           error.message,
    };
  }
}

/**
 * Predict dropout risk for many students at once (teacher dashboard).
 * @param {object[]} students  - array of student objects
 * @returns {Promise<object[]>} - array of { studentId, riskScore, riskLevel }
 */
export async function batchPredictDropoutRisk(students) {
  try {
    const payload = { students: students.map(buildPayload) };

    const res = await fetch(`${ML_BASE_URL}/batch-predict`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`ML batch error: ${res.status}`);

    const data = await res.json();

    // Normalise scores to 0-100
    return (data.predictions || []).map((p) => ({
      ...p,
      riskScore: Math.round((p.riskScore ?? 0) * 100),
    }));
  } catch (error) {
    console.error("[mlService] batchPredictDropoutRisk failed:", error.message);
    return [];
  }
}

/**
 * Simple health-check — call on app startup to verify Flask is running.
 * @returns {Promise<boolean>}
 */
export async function checkMLHealth() {
  try {
    const res = await fetch(`${ML_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}