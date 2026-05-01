import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Home, Calendar, Award, BookOpen, TrendingUp, LogOut, Menu, X, Bell } from "lucide-react";

import StudentHome        from "../components/student/StudentHome";
import StudentAttendance  from "../components/student/StudentAttendance";
import StudentGrades      from "../components/student/StudentGrades";
import StudentAssignments from "../components/student/StudentAssignments";
import StudentRisk        from "../components/student/StudentRisk";

const TABS = [
  { id:"home",        label:"Overview",    icon:Home       },
  { id:"attendance",  label:"Attendance",  icon:Calendar   },
  { id:"grades",      label:"Grades",      icon:Award      },
  { id:"assignments", label:"Assignments", icon:BookOpen   },
  { id:"risk",        label:"My Risk",     icon:TrendingUp },
];

const StudentDashboard = () => {
  const { user, profileId, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab,   setActiveTab]   = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [student,     setStudent]     = useState(null);
  const [dashData,    setDashData]    = useState(null);
  const [risk,        setRisk]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  const fetchData = useCallback(async()=>{
    if(!profileId) return;
    setLoading(true); setError("");
    try{
      const [studentRes, dashRes] = await Promise.all([
        api.get(`/student/${profileId}`),
        api.get(`/student/${profileId}/dashboard`),
      ]);
      setStudent(studentRes.data);
      setDashData(dashRes.data);
      // Fetch risk prediction separately
      try{ const r=await api.get(`/student/${profileId}/risk`); setRisk(r.data); }
      catch{ setRisk(null); }
    }catch(err){ setError(err.response?.data?.error||"Failed to load dashboard."); }
    finally{ setLoading(false); }
  },[profileId]);

  useEffect(()=>{ fetchData(); },[fetchData]);

  const handleLogout=()=>{ logout(); navigate("/login"); };

  const Sidebar=()=>(
    <aside className={`${sidebarOpen?"w-64":"w-0 overflow-hidden"} transition-all duration-300 bg-gradient-to-b from-green-700 to-teal-800 min-h-screen flex flex-col shrink-0`}>
      <div className="p-6 border-b border-green-600">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌳</span>
          <div><p className="text-white font-bold text-lg leading-tight">VidyaVriksh</p><p className="text-green-300 text-xs">Student Portal</p></div>
        </div>
      </div>
      {student&&(
        <div className="p-4 border-b border-green-600 bg-green-600/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-green-800 font-bold flex items-center justify-center text-sm">
              {student.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{student.name}</p>
              <p className="text-green-300 text-xs">Class {student.classGrade}-{student.section}</p>
              <p className="text-green-300 text-xs">Roll #{student.rollNo}</p>
            </div>
          </div>
        </div>
      )}
      <nav className="flex-1 p-4 space-y-1">
        {TABS.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab===id?"bg-white text-green-800 shadow":"text-green-200 hover:bg-green-600/50 hover:text-white"}`}>
            <Icon className="w-5 h-5 shrink-0"/>{label}
          </button>
        ))}
      </nav>
      <div className="p-4">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900/30 hover:text-red-200 transition text-sm font-semibold">
          <LogOut className="w-5 h-5"/> Logout
        </button>
      </div>
    </aside>
  );

  const renderContent=()=>{
    if(loading) return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"/>
        <p className="text-gray-500 font-medium">Loading dashboard…</p>
      </div>
    );
    if(error) return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <p className="text-red-700 font-semibold text-lg mb-2">Failed to load</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button onClick={fetchData} className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition">Retry</button>
      </div>
    );
    switch(activeTab){
      case "home":        return <StudentHome student={student} dashData={dashData} risk={risk}/>;
      case "attendance":  return <StudentAttendance studentId={profileId}/>;
      case "grades":      return <StudentGrades studentId={profileId}/>;
      case "assignments": return <StudentAssignments studentId={profileId}/>;
      case "risk":        return <StudentRisk student={student} risk={risk}/>;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={()=>setSidebarOpen(p=>!p)} className="text-gray-500 hover:text-gray-700">
            {sidebarOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}
          </button>
          <h2 className="text-lg font-bold text-gray-800">{TABS.find(t=>t.id===activeTab)?.label}</h2>
          <div className="ml-auto text-sm text-gray-600 font-medium">{user?.name}</div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};
export default StudentDashboard;