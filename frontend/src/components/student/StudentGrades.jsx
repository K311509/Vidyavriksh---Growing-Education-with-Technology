import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Award, TrendingUp, BookOpen } from "lucide-react";

const StudentGrades=({ studentId })=>{
  const [grades,   setGrades]   = useState([]);
  const [filter,   setFilter]   = useState("all");
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{
    if(!studentId) return;
    api.get(`/student/${studentId}/grades`)
      .then(res=>{
        const data=res.data||[];
        setGrades(data);
        setSubjects([...new Set(data.map(g=>g.subject))]);
      })
      .catch(()=>setGrades([]))
      .finally(()=>setLoading(false));
  },[studentId]);

  const filtered=filter==="all"?grades:grades.filter(g=>g.subject===filter);
  const avg=grades.length>0?(grades.reduce((s,g)=>s+(g.percentage||0),0)/grades.length).toFixed(1):0;
  const gradeColor=p=>p>=90?"text-green-600":p>=75?"text-blue-600":p>=60?"text-yellow-600":"text-red-600";

  if(loading) return <div className="text-center py-12 text-gray-500">Loading grades…</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800">My Grades</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[[<Award className="w-6 h-6 text-blue-600"/>,"Total",grades.length,"blue"],[<TrendingUp className="w-6 h-6 text-green-600"/>,"Average",`${avg}%`,"green"],[<BookOpen className="w-6 h-6 text-purple-600"/>,"Subjects",subjects.length,"purple"]].map(([icon,l,v,c],i)=>(
          <div key={i} className={`bg-${c}-50 border-2 border-${c}-200 rounded-xl p-5`}>
            {icon}<p className="text-sm text-gray-600 mt-2 mb-1">{l}</p><p className={`text-3xl font-bold text-${c}-800`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={()=>setFilter("all")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter==="all"?"bg-blue-600 text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>All</button>
          {subjects.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter===s?"bg-blue-600 text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{s}</button>
          ))}
        </div>
        {filtered.length>0
          ? <div className="space-y-3">
            {filtered.map((g,i)=>(
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border-l-4"
                style={{borderLeftColor:g.percentage>=80?"#10B981":g.percentage>=60?"#F59E0B":"#EF4444"}}>
                <div>
                  <p className="font-bold text-gray-800">{g.subject}</p>
                  <p className="text-sm text-gray-500">{g.examType} · {g.examDate?new Date(g.examDate).toLocaleDateString("en-IN"):""}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${gradeColor(g.percentage)}`}>{g.grade||g.score}</p>
                  <p className="text-xs text-gray-500">{g.score}/{g.maxScore} ({g.percentage?.toFixed(1)}%)</p>
                </div>
              </div>
            ))}
          </div>
          : <div className="text-center py-12 text-gray-400"><Award className="w-12 h-12 mx-auto mb-3 text-gray-300"/><p>No grades yet</p></div>
        }
      </div>
    </div>
  );
};
export default StudentGrades;