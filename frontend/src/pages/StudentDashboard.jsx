import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { BookOpen, ClipboardList, CalendarCheck, Award, LogOut } from "lucide-react";

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const studentId = user.studentId;

      // Fetch grades
      const gradeResponse = await api.get(`/grades/student/${studentId}`);
      setGrades(gradeResponse.data.data || []);

      // Fetch assignments
      const assignmentResponse = await api.get(`/assignments/student/${studentId}`);
      setAssignments(assignmentResponse.data.data || []);

      // Attendance
      const attendanceResponse = await api.get(`/attendance/student/${studentId}`);
      setAttendance(attendanceResponse.data.data || null);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* ---------------- HEADER ---------------- */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">VidyaVriksh Portal</h1>
              <p className="text-sm text-gray-500">Student Dashboard</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        
        {/* ---------------- WELCOME ---------------- */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.fullName}! 👋
          </h2>
          <p className="text-gray-600 mt-1">Here is your academic overview.</p>
        </div>

        {/* ---------------- RISK & ATTENDANCE BOXES ---------------- */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Attendance */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex items-center gap-3 mb-3">
              <CalendarCheck className="text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-700">Attendance</h3>
            </div>
            {attendance ? (
              <p className="text-gray-700 text-lg">
                <span className="font-semibold">{attendance.percentage}%</span> attendance recorded
              </p>
            ) : (
              <p className="text-gray-500">No attendance data available.</p>
            )}
          </div>

          {/* Risk Level */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex items-center gap-3 mb-3">
              <Award className="text-red-600" />
              <h3 className="text-xl font-semibold text-gray-700">Dropout Risk Level</h3>
            </div>
            <p className="text-lg font-semibold text-gray-700">
              {user?.riskLevel || "Not Evaluated"}
            </p>
          </div>

        </div>

        {/* ---------------- ASSIGNMENTS ---------------- */}
        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-700">Your Assignments</h2>
          </div>

          {assignments.length === 0 ? (
            <p className="text-gray-600">No assignments found.</p>
          ) : (
            <ul className="space-y-4">
              {assignments.map((a) => (
                <li
                  key={a._id}
                  className="p-4 rounded-lg border hover:bg-gray-50 transition"
                >
                  <p className="font-semibold text-gray-800">{a.title}</p>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------------- GRADES (UPDATED ONLY THIS) ---------------- */}
        <div className="bg-white shadow rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Grades</h2>

          {grades.length === 0 ? (
            <p className="text-gray-600">No grades uploaded yet by teachers.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full rounded-lg overflow-hidden border">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="p-3 text-left">Subject</th>
                    <th className="p-3 text-left">Assignment</th>
                    <th className="p-3 text-left">Grade</th>
                    <th className="p-3 text-left">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g._id} className="border-b hover:bg-gray-100">
                      <td className="p-3">{g.subject}</td>
                      <td className="p-3">{g.assignmentTitle}</td>
                      <td className="p-3 font-bold text-blue-700">{g.grade}</td>
                      <td className="p-3 text-gray-600">{g.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
