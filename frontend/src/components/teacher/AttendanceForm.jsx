import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { CheckCircle, XCircle } from "lucide-react";

const AttendanceForm = ({ classGrade, section, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
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

      // Initialize attendance map
      const initial = {};
      filtered.forEach((s) => {
        initial[s.studentId] = "PRESENT";
      });

      setAttendance(initial);
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/attendance", {
        classGrade,
        section,
        records: attendance,
      });

      onSuccess?.();
      alert("Attendance submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit attendance.");
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                handleAttendanceChange(student.studentId, "PRESENT")
              }
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                attendance[student.studentId] === "PRESENT"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Present
            </button>

            <button
              type="button"
              onClick={() =>
                handleAttendanceChange(student.studentId, "ABSENT")
              }
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                attendance[student.studentId] === "ABSENT"
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <XCircle className="w-4 h-4" />
              Absent
            </button>
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow hover:opacity-90 transition"
      >
        Submit Attendance
      </button>
    </form>
  );
};

export default AttendanceForm;
