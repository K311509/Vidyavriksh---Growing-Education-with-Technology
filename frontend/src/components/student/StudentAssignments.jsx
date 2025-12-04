import React, { useEffect, useState } from "react";
import api from "../../services/api";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/assignments/");
      setAssignments(res.data);
    };
    load();
  }, []);

  return (
    <div className="card">
      <h2>Available Assignments</h2>

      {assignments.map(a => (
        <div key={a._id} className="assignment-card">
          <h3>{a.title}</h3>
          <p>{a.description}</p>
          <p><strong>Deadline:</strong> {a.deadline}</p>

          <a href={`/student/submit-assignment/${a._id}`}>
            <button>Submit Assignment</button>
          </a>
        </div>
      ))}
    </div>
  );
};

export default StudentAssignments;
