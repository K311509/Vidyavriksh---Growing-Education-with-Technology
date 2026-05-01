import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Users, CheckSquare, BookOpen, Award, AlertTriangle,
  BarChart2, LogOut, Menu, X, Bell, Home
} from "lucide-react";

// ── Sub-components ─────────────────────────────────────────────────────────────
import QuickStats       from "../components/teacher/QuickStats";
import StudentList      from "../components/teacher/StudentList";
import AttendanceForm   from "../components/teacher/AttendanceForm";
import CreateAssignment from "../components/teacher/CreateAssignment";
import TeacherAssignments from "../components/teacher/TeacherAssignments";
import GradeForm        from "../components/teacher/GradeForm";
import HighRiskStudents from "../components/teacher/HighRiskStudents";
import AlertPanel       from "../components/teacher/AlertPanel";

const TABS = [
  { id: "home",        label: "Overview",    icon: Home },
  { id: "students",    label: "Students",    icon: Users },
  { id: "attendance",  label: "Attendance",  icon: CheckSquare },
  { id: "assignments", label: "Assignments", icon: BookOpen },
  { id: "grades",      label: "Grades",      icon: Award },
  { id: "risk",        label: "Risk Monitor",icon: AlertTriangle },
  { id: "alerts",      label: "Alerts",      icon: Bell },
];

const TeacherDashboard = () => {
  const { user, profileId, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teacher, setTeacher]         = useState(null);
  const [students, setStudents]       = useState([]);
  const [stats, setStats]             = useState(null);
  const [alerts, setAlerts]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  // ── Fetch teacher profile + students + stats ─────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!profileId || !user?.id) return;
    setLoading(true);
    setError("");
    try {
      const [teacherRes, studentsRes] = await Promise.all([
        api.get(`/teacher/profile?userId=${user.id}`),
        api.get(`/teacher/${profileId}/students`),
      ]);
      const teacherData = teacherRes.data;
      const studentList = studentsRes.data || [];
      setTeacher(teacherData);
      setStudents(studentList);

      // Compute stats from student list (no separate stats endpoint needed)
      const high = studentList.filter(s => s.riskLevel === "HIGH").length;
      const avgAtt = studentList.length
        ? studentList.reduce((a, s) => a + (s.attendance || 0), 0) / studentList.length
        : 0;
      const avgGpa = studentList.length
        ? studentList.reduce((a, s) => a + (s.gpa || 0), 0) / studentList.length
        : 0;
      setStats({
        totalStudents: studentList.length,
        highRiskStudents: high,
        averageAttendance: avgAtt,
        averageGPA: avgGpa,
      });
      setAlerts([]); // alerts from backend optional
      // Replace your fetchData catch block with this:
} catch (err) {
  const status = err.response?.status;

  // Stale session — user no longer exists in DB
  if (status === 400 || status === 401 || status === 403) {
    localStorage.clear();
    sessionStorage.clear();
    logout();
    navigate("/login");
    return;
    }

     setError(err.response?.data?.error || "Failed to load dashboard. Check your connection.");
    } finally {
    
       setLoading(false);
     }
 }, [profileId, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/acknowledge`);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch { /* silent */ }
  };

  const highRiskStudents = students.filter(s => s.riskLevel === "HIGH");

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 bg-gradient-to-b from-blue-800 to-indigo-900 min-h-screen flex flex-col shrink-0`}>
      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌳</span>
          <div>
            <p className="text-white font-bold text-lg leading-tight">VidyaVriksh</p>
            <p className="text-blue-300 text-xs">Teacher Portal</p>
          </div>
        </div>
      </div>

      {/* Teacher info */}
      {teacher && (
        <div className="p-4 border-b border-blue-700 bg-blue-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-blue-800 font-bold flex items-center justify-center text-sm">
              {teacher.name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{teacher.name}</p>
              <p className="text-blue-300 text-xs">Class {teacher.assignedClass}-{teacher.section}</p>
              <p className="text-blue-300 text-xs truncate">{teacher.subject}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === id
                ? "bg-white text-blue-800 shadow"
                : "text-blue-200 hover:bg-blue-700/50 hover:text-white"
            }`}>
            <Icon className="w-5 h-5 shrink-0" />
            {label}
            {id === "alerts" && alerts.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{alerts.length}</span>
            )}
            {id === "risk" && highRiskStudents.length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">{highRiskStudents.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900/30 hover:text-red-200 transition text-sm font-semibold">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );

  // ── Tab content ──────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    );

    if (error) return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-semibold text-lg mb-2">Failed to load data</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button onClick={fetchData} className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition">
          Retry
        </button>
      </div>
    );

    switch (activeTab) {
      case "home": return (
        <div className="space-y-6">
          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8">
            <h1 className="text-3xl font-bold mb-1">Welcome back, {teacher?.name?.split(" ")[0] || user?.name}! 👋</h1>
            <p className="text-blue-100">Class {teacher?.assignedClass}-{teacher?.section} · {teacher?.subject}</p>
          </div>
          <QuickStats stats={stats} />
          {highRiskStudents.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
              <p className="font-bold text-red-700 mb-1">⚠️ {highRiskStudents.length} student(s) at HIGH dropout risk</p>
              <p className="text-red-600 text-sm">Go to Risk Monitor tab for details.</p>
              <button onClick={() => setActiveTab("risk")} className="mt-2 text-red-700 underline text-sm font-semibold">View Now →</button>
            </div>
          )}
          <StudentList students={students.slice(0, 5)} onSelectStudent={() => setActiveTab("students")} />
        </div>
      );

      case "students": return (
        <StudentList students={students} onSelectStudent={() => {}} />
      );

      case "attendance": return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-blue-600" /> Mark Attendance
          </h2>
          {teacher ? (
            <AttendanceForm
              teacherId={profileId}
              classGrade={teacher.assignedClass}
              section={teacher.section}
              onSuccess={fetchData}
            />
          ) : <p className="text-gray-500">Loading teacher info...</p>}
        </div>
      );

      case "assignments": return (
        <div className="space-y-6">
          <CreateAssignment teacherId={profileId} classGrade={teacher?.assignedClass} section={teacher?.section} />
          <TeacherAssignments teacherId={profileId} students={students} />
        </div>
      );

      case "grades": return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="w-7 h-7 text-purple-600" /> Enter Grades
          </h2>
          {teacher ? (
            <GradeForm
              teacherId={profileId}
              classGrade={teacher.assignedClass}
              section={teacher.assignedSection}
              onSuccess={fetchData}
            />
          ) : <p className="text-gray-500">Loading...</p>}
        </div>
      );

      case "risk": return (
        <HighRiskStudents students={students} />
      );

      case "alerts": return (
        <AlertPanel alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
      );

      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(p => !p)} className="text-gray-500 hover:text-gray-700">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="ml-auto flex items-center gap-3">
            {alerts.length > 0 && (
              <button onClick={() => setActiveTab("alerts")} className="relative">
                <Bell className="w-6 h-6 text-gray-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{alerts.length}</span>
              </button>
            )}
            <span className="text-sm text-gray-600 font-medium">{user?.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;