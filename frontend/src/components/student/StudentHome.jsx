import React from "react";
import { Award, Calendar, Trophy, BookOpen, TrendingUp, AlertCircle } from "lucide-react";

const RISK_CLS = { LOW:"bg-green-100 text-green-800 border-green-300", MEDIUM:"bg-yellow-100 text-yellow-800 border-yellow-300", HIGH:"bg-red-100 text-red-800 border-red-300" };

const StatCard=({icon,label,value,sub,color})=>{
  const bg={blue:"bg-blue-50 border-blue-200",green:"bg-green-50 border-green-200",purple:"bg-purple-50 border-purple-200",yellow:"bg-yellow-50 border-yellow-200"};
  return (
    <div className={`${bg[color]} border-2 rounded-xl p-5 hover:shadow-lg transition`}>
      {icon}
      <p className="text-sm text-gray-600 mt-2 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      {sub&&<p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
};

const StudentHome=({ student, dashData, risk })=>{
  if(!student) return <div className="text-center py-12 text-gray-400">Loading…</div>;
  const { recentGrades=[], recentAttendance=[], activeAlerts=[] } = dashData||{};

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-1">Welcome back, {student.name?.split(" ")[0]}! 👋</h1>
        <p className="text-green-100">Class {student.classGrade}-{student.section} · Roll #{student.rollNo}</p>
      </div>

      {/* Alerts */}
      {activeAlerts.length>0&&(
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0"/>
            <div>
              <h3 className="font-semibold text-red-800 mb-1">{activeAlerts.length} active alert(s)</h3>
              {activeAlerts.map((a,i)=><p key={i} className="text-sm text-red-700">• {a.message}</p>)}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Award className="w-6 h-6 text-blue-600"/>}   label="GPA"        value={student.gpa?.toFixed(2)??"N/A"} sub="Out of 10.0"         color="blue"/>
        <StatCard icon={<Calendar className="w-6 h-6 text-green-600"/>} label="Attendance" value={`${student.attendance??0}%`}    sub={`${student.totalPresent??0} days`} color="green"/>
        <StatCard icon={<Trophy className="w-6 h-6 text-purple-600"/>} label="Points"     value={student.gamificationPoints??0}  sub="Gamification pts"   color="purple"/>
        <StatCard icon={<BookOpen className="w-6 h-6 text-yellow-600"/>} label="Badges"   value={student.badges?.length??0}      sub="Achievements"       color="yellow"/>
      </div>

      {/* Risk */}
      {risk&&(
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-6 h-6"/>Dropout Risk Assessment</h3>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold mb-3 ${RISK_CLS[risk.riskLevel]||RISK_CLS.LOW}`}>
            Risk Level: {risk.riskLevel} · Score: {risk.riskScore}
          </div>
          {risk.riskFactors?.length>0&&(
            <div className="mt-3">
              <p className="font-semibold text-gray-700 mb-2 text-sm">Risk Factors:</p>
              {risk.riskFactors.map((f,i)=><p key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-red-500">•</span>{f}</p>)}
            </div>
          )}
          {risk.recommendations?.length>0&&(
            <div className="mt-3">
              <p className="font-semibold text-gray-700 mb-2 text-sm">Recommendations:</p>
              {risk.recommendations.map((r,i)=><p key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-green-500">✓</span>{r}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Recent Grades */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Grades</h3>
        {recentGrades.length>0
          ? <div className="space-y-2">
            {recentGrades.slice(0,5).map((g,i)=>(
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div><p className="font-semibold text-gray-800">{g.subject}</p><p className="text-xs text-gray-500">{g.examType}</p></div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">{g.grade||g.score}</p>
                  <p className="text-xs text-gray-500">{g.score}/{g.maxScore} ({g.percentage?.toFixed(1)}%)</p>
                </div>
              </div>
            ))}
          </div>
          : <p className="text-center text-gray-400 py-6">No grades yet.</p>
        }
      </div>

      {/* Badges */}
      {student.badges?.length>0&&(
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Badges</h3>
          <div className="flex flex-wrap gap-3">
            {student.badges.map((b,i)=>(
              <div key={i} className="bg-yellow-50 border-2 border-yellow-300 rounded-xl px-4 py-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-600"/><span className="font-semibold text-yellow-800">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentHome;