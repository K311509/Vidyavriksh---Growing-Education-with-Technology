import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Award } from "lucide-react";

const GradeForm = ({ classGrade, section, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [classGrade, section]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student");
      const filtered = res.data.data.filter(
        (s) =>
          s.classGrade == classGrade &&
          s.section?.toLowerCase() === section?.toLowerCase()
      );

      setStudents(filtered);

      // Initialize grade map
      const initial = {};
      filtered.forEach((s) => {
        initial[s.studentId] = "";
      });

      setGrades(initial);
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, value) => {
    setGrades({
      ...grades,
      [studentId]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/grade", {
        classGrade,
        section,
        records: grades,
      });

      onSuccess?.();
      alert("Grades submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit grades.");
    }
  };

  if (loading) {
    return <p className="text-gray-600 text-center py-4">Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {students.map((student) => (
        <div
          key={student.studentId}
          className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-gray-800">
              {student.user?.fullName}
            </p>
            <p className="text-gray-500 text-sm">ID: {student.studentId}</p>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-yellow-600" />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Marks"
              value={grades[student.studentId]}
              onChange={(e) =>
                handleGradeChange(student.studentId, e.target.value)
              }
              className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow hover:opacity-90 transition"
      >
        Submit Grades
      </button>
    </form>
  );
};

export default GradeForm;
