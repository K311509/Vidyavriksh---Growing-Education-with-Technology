import React, { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const [answer, setAnswer] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post(`/assignments/submit/${assignmentId}`, {
        answer,
      });

      alert("Assignment submitted successfully!");
      setAnswer("");
    } catch (error) {
      console.error("Error submitting assignment", error);
    }
  };

  return (
    <div className="card">
      <h2>Submit Assignment</h2>

      <form onSubmit={handleSubmit}>
        <label>Your Answer:</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />

        <button type="submit">Submit Assignment</button>
      </form>
    </div>
  );
};

export default SubmitAssignment;
