import React, { useEffect, useState } from "react";
import api from "../../services/api";

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const fetchAssignments = async () => {
    const res = await api.get("/assignments/");
    setAssignments(res.data);
  };

  const viewSubmissions = async (assignmentId) => {
    const res = await api.get(`/assignments/${assignmentId}/submissions`);
    setSubmissions(res.data);
  };

  const gradeSubmission = async (sid, grade) => {
    await api.post(`/assignments/grade/${sid}`, { grade });
    alert("Submission graded!");
    setSubmissions(submissions.map(s => s._id === sid ? { ...s, grade } : s));
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="card">
      <h2>Your Assignments</h2>

      {assignments.map((a) => (
        <div key={a._id} className="assignment-card">
          <h3>{a.title}</h3>
          <p>{a.description}</p>
          <p><strong>Deadline:</strong> {a.deadline}</p>

          <button onClick={() => viewSubmissions(a._id)}>
            View Submissions
          </button>
        </div>
      ))}

      <h3>Submissions</h3>
      {submissions.map((s) => (
        <div key={s._id} className="submission-card">
          <p><strong>Student:</strong> {s.studentName}</p>
          <p><strong>Answer:</strong> {s.answer}</p>

          <label>Give Grade:</label>
          <input
            type="text"
            defaultValue={s.grade || ""}
            onBlur={(e) => gradeSubmission(s._id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default TeacherAssignments;
