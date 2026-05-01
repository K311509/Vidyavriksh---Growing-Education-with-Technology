import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Save, History } from "lucide-react";

const CYCLE  = { PRESENT: "ABSENT", ABSENT: "LATE", LATE: "PRESENT" };
const STYLES = {
  PRESENT: { bg: "bg-green-100 text-green-700 border-green-300", label: "Present" },
  ABSENT:  { bg: "bg-red-100 text-red-700 border-red-300",       label: "Absent"  },
  LATE:    { bg: "bg-yellow-100 text-yellow-700 border-yellow-300", label: "Late"  },
};

const AttendanceForm = ({ teacherId, classGrade, section, onSuccess }) => {
  const today = new Date().toISOString().split("T")[0];
  const [students,   setStudents]   = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date,       setDate]       = useState(today);
  const [history,    setHistory]    = useState([]);
  const [showHist,   setShowHist]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState({ text: "", ok: true });

  useEffect(() => { if (teacherId) loadStudents(); }, [teacherId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teacher/${teacherId}/students`);
      const list = res.data || [];
      setStudents(list);
      const init = {};
      list.forEach(s => { init[s.id] = "PRESENT"; });
      setAttendance(init);
    } catch (e) {
      setMsg({ text: "Failed to load students: " + (e.response?.data?.error || e.message), ok: false });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      // Fetch attendance for each student and aggregate
      const records = [];
      for (const s of students.slice(0, 5)) {
        const res = await api.get(`/attendance/student/${s.id}`);
        (res.data?.data || res.data || []).forEach(r => {
          records.push({ studentName: s.name, date: r.date, status: r.status });
        });
      }
      records.sort((a, b) => b.date.localeCompare(a.date));
      setHistory(records.slice(0, 20));
      setShowHist(true);
    } catch { setHistory([]); setShowHist(true); }
  };

  const toggle  = id => setAttendance(p => ({ ...p, [id]: CYCLE[p[id]] || "PRESENT" }));
  const markAll = s  => { const u = {}; students.forEach(st => { u[st.id] = s; }); setAttendance(u); };

  // Submit one attendance record per student using /api/attendance endpoint
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: "", ok: true });
    try {
      const promises = students.map(s =>
        api.post("/attendance", {
          studentId: s.id,
          date:      date,
          status:    attendance[s.id] || "PRESENT",
        }).catch(err => {
          // If already marked for this date, ignore duplicate error
          if (err.response?.status === 400) return null;
          throw err;
        })
      );
      await Promise.all(promises);
      setMsg({ text: `✅ Attendance saved for ${date}`, ok: true });
      onSuccess?.();
    } catch (err) {
      setMsg({ text: "❌ " + (err.response?.data?.error || "Save failed."), ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading students…</div>;
  if (students.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <p className="font-semibold">No students found for Class {classGrade}-{section}.</p>
      <p className="text-sm mt-1">Make sure students are registered with matching class and section.</p>
    </div>
  );

  const counts = { present: 0, absent: 0, late: 0 };
  Object.values(attendance).forEach(v => {
    if (v === "PRESENT") counts.present++;
    else if (v === "ABSENT") counts.absent++;
    else if (v === "LATE") counts.late++;
  });

  return (
    <div>
      {/* Date + History */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div>
          <label className="text-sm font-semibold text-gray-600 mr-2">Date:</label>
          <input type="date" value={date} max={today}
            onChange={e => setDate(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        </div>
        <button type="button" onClick={loadHistory}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
          <History className="w-4 h-4" /> View History
        </button>
      </div>

      {/* History panel */}
      {showHist && (
        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-gray-700">Recent Attendance</h4>
            <button onClick={() => setShowHist(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>
          {history.length === 0
            ? <p className="text-gray-400 text-sm">No records yet.</p>
            : history.map((r, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b border-gray-200 last:border-0 text-sm">
                <span className="text-gray-700">{r.studentName}</span>
                <span className="text-gray-500">{r.date}</span>
                <span className={`font-semibold ${r.status === "PRESENT" ? "text-green-600" : r.status === "ABSENT" ? "text-red-600" : "text-yellow-600"}`}>{r.status}</span>
              </div>
            ))
          }
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[["Present", counts.present, "bg-green-50 border-green-200 text-green-800"],
          ["Absent",  counts.absent,  "bg-red-50 border-red-200 text-red-800"],
          ["Late",    counts.late,    "bg-yellow-50 border-yellow-200 text-yellow-800"]].map(([l, n, c]) => (
          <div key={l} className={`${c} border-2 rounded-xl p-3 text-center`}>
            <p className="text-2xl font-bold">{n}</p>
            <p className="text-xs font-semibold uppercase">{l}</p>
          </div>
        ))}
      </div>

      {/* Mark all */}
      <div className="flex gap-2 mb-4 items-center">
        <span className="text-sm text-gray-500">Mark all:</span>
        {["PRESENT", "ABSENT", "LATE"].map(s => (
          <button key={s} type="button" onClick={() => markAll(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${STYLES[s].bg} transition`}>
            {STYLES[s].label}
          </button>
        ))}
      </div>

      {/* Student rows */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {students.map(s => {
          const status = attendance[s.id] || "PRESENT";
          return (
            <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${STYLES[status].bg} transition`}>
              <div>
                <p className="font-semibold text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-500">Roll #{s.rollNo}</p>
              </div>
              <button type="button" onClick={() => toggle(s.id)}
                className={`px-6 py-2 rounded-xl border-2 font-bold text-sm ${STYLES[status].bg} hover:opacity-80 transition`}>
                {STYLES[status].label}
              </button>
            </div>
          );
        })}

        {msg.text && (
          <p className={`text-center font-semibold py-2 ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
        )}
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60">
          <Save className="w-5 h-5" /> {saving ? "Saving…" : `Save Attendance for ${date}`}
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm;