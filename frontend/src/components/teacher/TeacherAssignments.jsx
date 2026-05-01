import React, { useEffect, useState } from "react";
import api from "../../services/api";

const TeacherAssignments = ({ teacherId, students }) => {  // ✅ accept props
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});      // ✅ keyed by assignmentId
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const fetchAssignments = async () => {
    if (!teacherId) return;                                 // ✅ guard against undefined
    setLoading(true);
    try {
      const res = await api.get(`/teacher/${teacherId}/assignments`);
      setAssignments(res.data || []);
    } catch (err) {
      setError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const viewSubmissions = async (assignmentId) => {
    try {
      const res = await api.get(`/teacher/${teacherId}/assignments/${assignmentId}/submissions`);
      setSubmissions(prev => ({ ...prev, [assignmentId]: res.data || [] }));
    } catch {
      alert("Failed to load submissions.");
    }
  };

  const gradeSubmission = async (assignmentId, sid, grade) => {
    try {
      await api.post(`/teacher/${teacherId}/assignments/grade/${sid}`, { grade });
      setSubmissions(prev => ({
        ...prev,
        [assignmentId]: prev[assignmentId].map(s =>
          s._id === sid ? { ...s, grade } : s
        ),
      }));
    } catch {
      alert("Failed to save grade.");
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [teacherId]);               // ✅ re-fetch if teacherId changes

  if (loading) return <p className="text-gray-500 p-4">Loading assignments...</p>;
  if (error)   return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Assignments</h2>

      {assignments.length === 0 && (
        <p className="text-gray-500">No assignments created yet.</p>
      )}

      {assignments.map((a) => (
        <div key={a.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">{a.title}</h3>
          <p className="text-gray-600 text-sm">{a.description}</p>
          <p className="text-sm text-gray-500">
            <strong>Deadline:</strong> {new Date(a.deadline).toLocaleDateString()}
          </p>

          <button
            onClick={() => viewSubmissions(a.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            View Submissions
          </button>

          {/* Submissions for this assignment */}
          {submissions[a.id] && (
            <div className="mt-3 space-y-3">
              <h4 className="font-semibold text-gray-700">
                Submissions ({submissions[a.id].length})
              </h4>
              {submissions[a.id].length === 0 && (
                <p className="text-gray-400 text-sm">No submissions yet.</p>
              )}
              {submissions[a.id].map((s) => (
                <div key={s.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-sm"><strong>Student:</strong> {s.studentName}</p>
                  <p className="text-sm"><strong>Answer:</strong> {s.answer}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm font-medium text-gray-700">Grade:</label>
                    <input
                      type="text"
                      defaultValue={s.grade || ""}
                      onBlur={(e) => gradeSubmission(a.id, s.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeacherAssignments;