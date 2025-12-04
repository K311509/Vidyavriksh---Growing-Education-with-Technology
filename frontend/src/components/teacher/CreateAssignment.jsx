import React, { useState } from "react";
import api from "../../services/api";
import { FilePlus, Calendar, BookOpen, CheckCircle } from "lucide-react";

const CreateAssignment = () => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      subject,
      instructions,
      dueDate,
    };

    try {
      await api.post("/assignments", payload);
      setSuccess(true);

      // Reset fields
      setTitle("");
      setSubject("");
      setDueDate("");
      setInstructions("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating assignment:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-600 text-white rounded-xl shadow">
          <FilePlus className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Create New Assignment</h2>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-5">
          <CheckCircle className="w-5 h-5" />
          <span>Assignment created successfully!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Assignment Title
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            placeholder="Enter assignment title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Subject
          </label>
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

        {/* Due Date */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Due Date
          </label>
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

        {/* Instructions */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <textarea
            className="w-full h-32 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            placeholder="Write assignment instructions..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl shadow hover:bg-purple-700 transition-all"
        >
          Create Assignment
        </button>
      </form>
    </div>
  );
};

export default CreateAssignment;
