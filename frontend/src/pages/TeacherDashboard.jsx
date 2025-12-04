import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  LogOut,
  FilePlus,
  Eye,
  Check,
  Paperclip,
  Search
} from "lucide-react";

/**
 * TeacherDashboard.jsx
 * Option A - Sidebar layout with these tabs:
 * - Students
 * - Attendance
 * - Grades (upload)
 * - Create Assignment
 * - Assignments & Submissions (view + grade)
 *
 * Note: adjust endpoints if your backend differs.
 */

const TeacherDashboard = () => {
  const { user, logout } = useAuth() || {};
  const [tab, setTab] = useState("students");

  // shared data
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // students search/select
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Attendance state
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: "PRESENT"|"ABSENT" }

  // Grades state
  const [gradesMap, setGradesMap] = useState({}); // { studentId: marks }

  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    classGrade: "",
    section: "",
    dueDate: ""
  });
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  // Submissions view
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingDrafts, setGradingDrafts] = useState({}); // { submissionId: { marks, feedback } }

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [sRes, aRes] = await Promise.all([
        api.get("/student").catch(() => ({ data: { data: [] } })),
        api.get("/assignments").catch(() => ({ data: { data: [] } }))
      ]);
      setStudents(sRes?.data?.data || []);
      setAssignments(aRes?.data?.data || []);
    } catch (err) {
      console.error("Load initial error:", err);
      setMessage({ type: "error", text: "Failed to load data." });
    } finally {
      setLoading(false);
    }
  };

  // Filtered students by search/class/section
  const filteredStudents = students.filter((s) => {
    const name = s.user?.fullName || "";
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedClass && String(s.classGrade) !== String(selectedClass)) return false;
    if (selectedSection && String(s.section).toLowerCase() !== String(selectedSection).toLowerCase()) return false;
    return true;
  });

  /* ---------- Attendance ---------- */
  const initAttendanceForFiltered = () => {
    const map = {};
    filteredStudents.forEach((s) => {
      map[s.studentId] = "PRESENT";
    });
    setAttendanceMap(map);
  };

  const toggleAttendance = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async (e) => {
    e.preventDefault();
    try {
      await api.post("/attendance", {
        classGrade: selectedClass || null,
        section: selectedSection || null,
        records: attendanceMap
      });
      setMessage({ type: "success", text: "Attendance saved." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save attendance." });
    }
  };

  /* ---------- Grades Upload ---------- */
  const updateGrade = (studentId, value) => {
    setGradesMap((p) => ({ ...p, [studentId]: value }));
  };

  const submitGrades = async (e) => {
    e.preventDefault();
    try {
      // payload example { classGrade, section, records: {studentId: marks} }
      await api.post("/grade", {
        classGrade: selectedClass || null,
        section: selectedSection || null,
        records: gradesMap
      });
      setMessage({ type: "success", text: "Grades uploaded." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to upload grades." });
    }
  };

  /* ---------- Create Assignment ---------- */
  const handleAssignmentFile = (file) => setAssignmentFile(file);

  const submitAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.classGrade || !newAssignment.section || !newAssignment.dueDate) {
      setMessage({ type: "error", text: "Please fill title, class, section, due date." });
      return;
    }

    setCreatingAssignment(true);
    try {
      const form = new FormData();
      form.append("title", newAssignment.title);
      form.append("description", newAssignment.description);
      form.append("classGrade", newAssignment.classGrade);
      form.append("section", newAssignment.section);
      form.append("dueDate", newAssignment.dueDate);
      form.append("createdBy", user?.fullName || user?.name || "Teacher");
      if (assignmentFile) form.append("attachment", assignmentFile);

      const res = await api.post("/assignments", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const created = res?.data?.data;
      if (created) {
        setAssignments((p) => [created, ...p]);
        setNewAssignment({ title: "", description: "", classGrade: "", section: "", dueDate: "" });
        setAssignmentFile(null);
        setMessage({ type: "success", text: "Assignment created." });
      } else {
        setMessage({ type: "error", text: "Assignment created but no data returned." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to create assignment." });
    } finally {
      setCreatingAssignment(false);
    }
  };

  /* ---------- View Submissions & Grade ---------- */
  const openSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`).catch(() => ({ data: { data: [] } }));
      setSubmissions(res?.data?.data || []);
      // initialize drafts
      const drafts = {};
      (res?.data?.data || []).forEach((s) => {
        drafts[s._id] = { marks: s.marks ?? "", feedback: s.feedback ?? "" };
      });
      setGradingDrafts(drafts);
      setTab("submissions");
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load submissions." });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const gradeSubmission = async (submissionId) => {
    const draft = gradingDrafts[submissionId];
    if (!draft) return;
    try {
      await api.put(`/assignments/${selectedAssignment._id}/submissions/${submissionId}/grade`, {
        marks: draft.marks !== "" ? Number(draft.marks) : null,
        feedback: draft.feedback,
        gradedBy: user?.fullName || user?.name || "Teacher"
      }).catch(() => null);

      // refresh submissions
      const res = await api.get(`/assignments/${selectedAssignment._id}/submissions`).catch(() => ({ data: { data: [] } }));
      setSubmissions(res?.data?.data || []);
      setMessage({ type: "success", text: "Saved grading." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save grading." });
    }
  };

  /* ---------- UI helpers ---------- */
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">VidyaVriksh</h1>
              <p className="text-sm text-gray-600">Teacher Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">Welcome, <strong>{user?.fullName || user?.name || "Teacher"}</strong></div>
            <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white p-4 rounded-2xl shadow">
          <nav className="space-y-2">
            <SidebarButton icon={<Users className="w-5 h-5" />} text="Students" active={tab==="students"} onClick={() => setTab("students")} />
            <SidebarButton icon={<Calendar className="w-5 h-5" />} text="Attendance" active={tab==="attendance"} onClick={() => { setTab("attendance"); initAttendanceForFiltered(); }} />
            <SidebarButton icon={<Award className="w-5 h-5" />} text="Grades" active={tab==="grades"} onClick={() => setTab("grades")} />
            <SidebarButton icon={<FilePlus className="w-5 h-5" />} text="Create Assignment" active={tab==="create"} onClick={() => setTab("create")} />
            <SidebarButton icon={<Eye className="w-5 h-5" />} text="Assignments & Submissions" active={tab==="assignments" || tab==="submissions"} onClick={() => setTab("assignments")} />
          </nav>

          {/* small filters */}
          <div className="mt-6 border-t pt-4">
            <div className="text-xs font-semibold text-gray-600 mb-2">Filters</div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Class</label>
                <input value={selectedClass} onChange={(e)=>setSelectedClass(e.target.value)} placeholder="e.g., 10" className="w-full px-2 py-1 border rounded mt-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Section</label>
                <input value={selectedSection} onChange={(e)=>setSelectedSection(e.target.value)} placeholder="e.g., A" className="w-full px-2 py-1 border rounded mt-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Search</label>
                <div className="flex items-center gap-2 mt-1">
                  <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Name or ID" className="flex-1 px-2 py-1 border rounded text-sm" />
                  <button onClick={()=>{ setSearch(""); setSelectedClass(""); setSelectedSection(""); }} className="px-2 py-1 bg-gray-100 rounded text-sm">Clear</button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main>
          {/* message */}
          {message && (
            <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-50 text-red-800"}`}>
              {message.text}
            </div>
          )}

          {/* Students Tab */}
          {tab === "students" && (
            <section className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Students ({filteredStudents.length})</h2>
                  <p className="text-sm text-gray-500">All students matching filters</p>
                </div>
                <div className="text-sm text-gray-600">Tip: Click an assignment &gt; "Submissions" to grade</div>
              </div>

              <div className="grid gap-3">
                {filteredStudents.map((s) => (
                  <div key={s._id || s.studentId} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{s.user?.fullName || "Unknown"}</div>
                      <div className="text-xs text-gray-500">ID: {s.studentId} • Class {s.classGrade || "-"}-{s.section || "-"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-600">{s.currentGPA ? `GPA: ${Number(s.currentGPA).toFixed(2)}` : "GPA: N/A"}</div>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">No students found.</div>}
              </div>
            </section>
          )}

          {/* Attendance Tab */}
          {tab === "attendance" && (
            <section className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow">
                <h2 className="text-xl font-semibold">Mark Attendance</h2>
                <p className="text-sm text-gray-500">Select Present/Absent for each student (filters applied).</p>
              </div>

              <form onSubmit={submitAttendance} className="space-y-3">
                <div className="grid gap-3">
                  {filteredStudents.map((s) => (
                    <div key={s.studentId} className="bg-white p-3 rounded-lg shadow flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{s.user?.fullName}</div>
                        <div className="text-xs text-gray-500">ID: {s.studentId}</div>
                      </div>

                      <div className="flex gap-2">
                        <button type="button" onClick={() => toggleAttendance(s.studentId, "PRESENT")} className={`px-3 py-1 rounded ${attendanceMap[s.studentId] === "PRESENT" ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>Present</button>
                        <button type="button" onClick={() => toggleAttendance(s.studentId, "ABSENT")} className={`px-3 py-1 rounded ${attendanceMap[s.studentId] === "ABSENT" ? "bg-red-100 text-red-800" : "bg-gray-100"}`}>Absent</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-3">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Submit Attendance</button>
                  <button type="button" onClick={() => { initAttendanceForFiltered(); setMessage({ type: "success", text: "Reset attendance to PRESENT" }); }} className="px-4 py-2 bg-gray-100 rounded-lg">Reset</button>
                </div>
              </form>
            </section>
          )}

          {/* Grades Tab */}
          {tab === "grades" && (
            <section className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow">
                <h2 className="text-xl font-semibold">Upload Grades</h2>
                <p className="text-sm text-gray-500">Enter marks for students (applies to filtered class/section).</p>
              </div>

              <form onSubmit={submitGrades} className="space-y-3">
                <div className="grid gap-3">
                  {filteredStudents.map((s) => (
                    <div key={s.studentId} className="bg-white p-3 rounded-lg shadow flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{s.user?.fullName}</div>
                        <div className="text-xs text-gray-500">ID: {s.studentId}</div>
                      </div>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Marks"
                        value={gradesMap[s.studentId] ?? ""}
                        onChange={(e) => updateGrade(s.studentId, e.target.value)}
                        className="w-28 px-3 py-2 border rounded"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-3">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Upload Grades</button>
                </div>
              </form>
            </section>
          )}

          {/* Create Assignment Tab */}
          {tab === "create" && (
            <section className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow">
                <h2 className="text-xl font-semibold">Create Assignment</h2>
                <p className="text-sm text-gray-500">Assign to a class & section; optional file attachment.</p>
              </div>

              <form onSubmit={submitAssignment} className="bg-white p-6 rounded-2xl shadow space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Title" value={newAssignment.title} onChange={(e)=>setNewAssignment({...newAssignment, title:e.target.value})} className="p-3 border rounded" required />
                  <input type="date" value={newAssignment.dueDate} onChange={(e)=>setNewAssignment({...newAssignment, dueDate:e.target.value})} className="p-3 border rounded" required />
                  <input placeholder="Class (e.g., 10)" value={newAssignment.classGrade} onChange={(e)=>setNewAssignment({...newAssignment, classGrade:e.target.value})} className="p-3 border rounded" required />
                  <input placeholder="Section (e.g., A)" value={newAssignment.section} onChange={(e)=>setNewAssignment({...newAssignment, section:e.target.value})} className="p-3 border rounded" required />
                </div>

                <textarea placeholder="Description / instructions" value={newAssignment.description} onChange={(e)=>setNewAssignment({...newAssignment, description:e.target.value})} className="w-full p-3 border rounded" rows={4}></textarea>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded cursor-pointer">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm">Attach file</span>
                    <input type="file" onChange={(e)=>handleAssignmentFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>

                  <div className="flex-1 text-sm text-gray-600">{assignmentFile ? assignmentFile.name : "No file attached"}</div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg" disabled={creatingAssignment}>
                    {creatingAssignment ? "Creating..." : "Create Assignment"}
                  </button>
                  <button type="button" onClick={()=> setNewAssignment({ title:"", description:"", classGrade:"", section:"", dueDate:"" })} className="px-4 py-2 bg-gray-100 rounded-lg">Clear</button>
                </div>
              </form>
            </section>
          )}

          {/* Assignments list -> open submissions */}
          {tab === "assignments" && (
            <section className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow flex justify-between items-center">
                <h2 className="text-xl font-semibold">Assignments</h2>
                <div className="text-sm text-gray-500">Click "Submissions" to view and grade.</div>
              </div>

              <div className="grid gap-3">
                {assignments.length === 0 && <div className="bg-white p-6 rounded shadow text-gray-500">No assignments yet.</div>}
                {assignments.map((a) => (
                  <div key={a._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-xs text-gray-500">Class {a.classGrade}-{a.section} • Due: {new Date(a.dueDate).toLocaleDateString()}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.attachmentUrl && <button onClick={()=> window.open(a.attachmentUrl, "_blank")} className="px-3 py-1 bg-gray-100 rounded">View File</button>}
                      <button onClick={() => openSubmissions(a)} className="px-3 py-1 bg-indigo-600 text-white rounded flex items-center gap-2"><Eye className="w-4 h-4" />Submissions</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Submissions tab */}
          {tab === "submissions" && selectedAssignment && (
            <section className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedAssignment.title}</h2>
                  <p className="text-sm text-gray-600">{selectedAssignment.description}</p>
                  <div className="text-xs text-gray-500 mt-1">Class {selectedAssignment.classGrade}-{selectedAssignment.section} • Due {new Date(selectedAssignment.dueDate).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelectedAssignment(null); setSubmissions([]); setTab("assignments"); }} className="px-3 py-1 bg-gray-100 rounded">Back</button>
                </div>
              </div>

              {loadingSubmissions ? <div className="text-gray-600">Loading submissions...</div> : (
                <div className="space-y-3">
                  {submissions.length === 0 && <div className="bg-white p-6 rounded shadow text-gray-500">No submissions yet.</div>}
                  {submissions.map((s) => (
                    <div key={s._id} className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="font-semibold">{s.studentName || s.studentId}</div>
                        <div className="text-xs text-gray-500">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}</div>

                        {s.textSubmission && <p className="mt-2 text-gray-700">{s.textSubmission}</p>}
                        {s.attachmentUrl && <p className="mt-2"><button onClick={()=> window.open(s.attachmentUrl, "_blank")} className="text-blue-600 hover:underline">Download attachment</button></p>}

                        {s.feedback && <div className="mt-2 p-2 bg-gray-50 rounded text-sm"><strong>Feedback:</strong> {s.feedback}</div>}
                      </div>

                      <div className="w-full md:w-80">
                        <label className="text-xs text-gray-500">Marks</label>
                        <input type="number" min="0" value={gradingDrafts[s._id]?.marks ?? ""} onChange={(e) => setGradingDrafts(p => ({...p, [s._id]: {...(p[s._id]||{}), marks: e.target.value}}))} className="w-full p-2 border rounded mb-2" />

                        <label className="text-xs text-gray-500">Feedback</label>
                        <textarea value={gradingDrafts[s._id]?.feedback ?? ""} onChange={(e) => setGradingDrafts(p => ({...p, [s._id]: {...(p[s._id]||{}), feedback: e.target.value}}))} className="w-full p-2 border rounded mb-2" rows={3} />

                        <div className="flex gap-2">
                          <button onClick={() => gradeSubmission(s._id)} className="flex-1 px-3 py-2 bg-green-600 text-white rounded flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Save Grade</button>
                          <button onClick={() => { setGradingDrafts(p => ({...p, [s._id]: {marks: "", feedback: ""}})); }} className="px-3 py-2 bg-gray-100 rounded">Clear</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </main>
      </div>
    </div>
  );
};

/* ----------------- small helper components ----------------- */
const SidebarButton = ({ icon, text, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-3 py-2 rounded ${active ? "bg-indigo-50 font-semibold" : "hover:bg-gray-50"}`}>
    <div className="text-indigo-600">{icon}</div>
    <div className="text-sm">{text}</div>
  </button>
);

export default TeacherDashboard;
