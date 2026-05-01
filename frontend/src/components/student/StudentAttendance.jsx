import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const STATUS_ICON={ PRESENT:<CheckCircle className="w-5 h-5 text-green-600"/>, ABSENT:<XCircle className="w-5 h-5 text-red-600"/>, LATE:<Clock className="w-5 h-5 text-yellow-600"/>, EXCUSED:<AlertCircle className="w-5 h-5 text-blue-600"/> };
const STATUS_CLS={ PRESENT:"bg-green-50 border-green-200 text-green-800", ABSENT:"bg-red-50 border-red-200 text-red-800", LATE:"bg-yellow-50 border-yellow-200 text-yellow-800", EXCUSED:"bg-blue-50 border-blue-200 text-blue-800" };

const StudentAttendance=({ studentId })=>{
  const [records, setRecords] = useState([]);
  const [filter,  setFilter]  = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!studentId) return;
    api.get(`/student/${studentId}/attendance`)
      .then(res=>setRecords(res.data||[]))
      .catch(()=>setRecords([]))
      .finally(()=>setLoading(false));
  },[studentId]);

  const filtered = filter==="all" ? records : records.filter(r=>r.status?.toLowerCase()===filter);
  const stats={ total:records.length, present:records.filter(r=>r.status==="PRESENT").length, absent:records.filter(r=>r.status==="ABSENT").length, late:records.filter(r=>r.status==="LATE").length };
  const pct = stats.total>0?((stats.present/stats.total)*100).toFixed(1):0;

  if(loading) return <div className="text-center py-12 text-gray-500">Loading attendance…</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Attendance Records</h2>
        <p className="text-gray-500 text-sm">Overall: <span className={`font-bold ${parseFloat(pct)>=75?"text-green-600":"text-red-600"}`}>{pct}%</span></p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["Total Days",stats.total,"blue"],["Present",stats.present,"green"],["Absent",stats.absent,"red"],["Late",stats.late,"yellow"]].map(([l,v,c])=>(
          <div key={l} className={`bg-${c}-50 border-2 border-${c}-200 rounded-xl p-4`}>
            <p className="text-sm text-gray-600 mb-1">{l}</p>
            <p className={`text-3xl font-bold text-${c}-800`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-2 mb-5 flex-wrap">
          {["all","present","absent","late"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm capitalize transition ${filter===f?"bg-green-600 text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              {f==="all"?"All":f}
            </button>
          ))}
        </div>
        {filtered.length>0
          ? <div className="space-y-3">
            {filtered.map((r,i)=>(
              <div key={i} className={`flex justify-between items-center p-4 border-2 rounded-xl ${STATUS_CLS[r.status]||"bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  {STATUS_ICON[r.status]}
                  <div>
                    <p className="font-semibold">{new Date(r.date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
                    {r.subject&&<p className="text-sm opacity-75">{r.subject}</p>}
                  </div>
                </div>
                <span className="font-bold">{r.status}</span>
              </div>
            ))}
          </div>
          : <div className="text-center py-12 text-gray-400"><Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300"/><p>No records found</p></div>
        }
      </div>
    </div>
  );
};
export default StudentAttendance;