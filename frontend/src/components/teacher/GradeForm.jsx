import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Award } from "lucide-react";

// ✅ Use teacherId prop instead of user.id
const GradeForm = ({ teacherId, classGrade, section, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (teacherId) fetchStudents();  // ✅ only need teacherId
  }, [teacherId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/teacher/${teacherId}/students`); // ✅ correct ID
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setStudents(data);
      const initialGrades = {};
      data.forEach((s) => { initialGrades[s.id] = ""; });
      setGrades(initialGrades);
    } catch (err) {
      setError("Failed to load students.");
      console.error("Error loading students:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, value) => {
    setGrades((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requests = Object.entries(grades)
      .filter(([_, score]) => score !== "")
      .map(([studentId, score]) => ({
        studentId,
        subject: "GENERAL",
        score: Number(score),
        maxScore: 100,
      }));

    if (requests.length === 0) {
      alert("Enter at least one grade");
      return;
    }

    try {
      for (const req of requests) {
        await api.post("/grades", req);
      }
      alert("Grades submitted successfully!");
      onSuccess?.();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err);
      alert("Failed to submit grades");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="ml-3 text-gray-500">Loading students...</p>
    </div>
  );

  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;

  if (!students.length) return (
    <p className="text-center text-gray-500 py-4">No students found for this class.</p>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {students.map((student) => (
        <div key={student.id}
          className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-800">
              {student.name || student.email || "Student"}
            </p>
            <p className="text-gray-400 text-xs">ID: {student.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-yellow-600" />
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Marks"
              value={grades[student.id] || ""}
              onChange={(e) => handleGradeChange(student.id, e.target.value)}
              className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      ))}

      <button type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow hover:opacity-90 transition">
        Submit Grades
      </button>
    </form>
  );
};

export default GradeForm;