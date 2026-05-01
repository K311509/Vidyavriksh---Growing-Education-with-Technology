import React, { useState } from "react";
import api from "../../services/api";
import { FilePlus, Calendar, BookOpen, CheckCircle, AlertCircle } from "lucide-react";

const CreateAssignment = ({ teacherId, classGrade, section }) => {
  const [title, setTitle]              = useState("");
  const [subject, setSubject]          = useState("");
  const [dueDate, setDueDate]          = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess]          = useState(false);
  const [error, setError]              = useState("");
  const [loading, setLoading]          = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) {
      setError("Teacher profile not loaded. Please refresh the page.");
      return;
    }

    const payload = {
      title,
      subject,
      description,  // ✅ matches AssignmentRequest.description
      dueDate,      // "2026-05-01" — matches LocalDate in AssignmentRequest
    };

    setLoading(true);
    setError("");
    try {
      // ✅ correct endpoint: /api/teacher/{teacherId}/assignments
      await api.post(`/teacher/${teacherId}/assignments`, payload);
      setSuccess(true);
      setTitle("");
      setSubject("");
      setDueDate("");
      setDescription("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.error
               || err.response?.data?.message
               || "Failed to create assignment.";
      setError(msg);
      console.error("Assignment error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-600 text-white rounded-xl shadow">
          <FilePlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Create New Assignment</h2>
          {classGrade && section && (
            <p className="text-sm text-gray-500">Class {classGrade}-{section}</p>
          )}
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-5">
          <CheckCircle className="w-5 h-5" />
          <span>Assignment created successfully!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-5">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium text-gray-700 mb-2">Assignment Title</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            placeholder="Enter assignment title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Subject</label>
          <div className="flex items-center gap-3">
            <BookOpen className="text-purple-600 w-5 h-5" />
            <input
              type="text"
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
              placeholder="e.g., Math, Science, English..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Due Date</label>
          <div className="flex items-center gap-3">
            <Calendar className="text-purple-600 w-5 h-5" />
            <input
              type="date"
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Instructions</label>
          <textarea
            className="w-full h-32 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            placeholder="Write assignment instructions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !teacherId}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl shadow hover:bg-purple-700 transition-all disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </div>
  );
};

export default CreateAssignment;