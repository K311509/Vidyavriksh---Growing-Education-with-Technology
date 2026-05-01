import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";

const StudentAssignments=({ studentId })=>{
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!studentId) return;
    api.get(`/student/${studentId}/assignments`)
      .then(res=>setAssignments(res.data||[]))
      .catch(()=>setAssignments([]))
      .finally(()=>setLoading(false));
  },[studentId]);

  if(loading) return <div className="text-center py-12 text-gray-500">Loading assignments…</div>;

  const today=new Date().toISOString().split("T")[0];
  const pending=assignments.filter(a=>a.myStatus==="PENDING"||!a.myStatus);
  const submitted=assignments.filter(a=>a.myStatus==="SUBMITTED"||a.myStatus==="GRADED"||a.myStatus==="LATE_SUBMITTED");

  const Card=({a})=>{
    const overdue=a.dueDate&&a.dueDate<today&&(a.myStatus==="PENDING"||!a.myStatus);
    const status=a.myStatus||"PENDING";
    return (
      <div className={`p-5 rounded-2xl border-2 ${overdue?"border-red-200 bg-red-50":status==="SUBMITTED"||status==="GRADED"?"border-green-200 bg-green-50":"border-gray-200 bg-white"} hover:shadow-md transition`}>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-gray-800 text-lg flex-1 pr-3">{a.title}</h4>
          <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
            status==="SUBMITTED"||status==="GRADED"?"bg-green-100 text-green-700":
            overdue?"bg-red-100 text-red-700":"bg-yellow-100 text-yellow-700"}`}>
            {overdue?"OVERDUE":status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">{a.subject}</p>
        {a.description&&<p className="text-sm text-gray-500 mb-3">{a.description}</p>}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4"/>
          <span>Due: {a.dueDate?new Date(a.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"No deadline"}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800">My Assignments</h2>
      </div>
      {assignments.length===0
        ? <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-lg"><BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300"/><p>No assignments yet</p></div>
        : <>
          {pending.length>0&&(
            <div>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-yellow-500"/>Pending ({pending.length})</h3>
              <div className="space-y-3">{pending.map(a=><Card key={a.id} a={a}/>)}</div>
            </div>
          )}
          {submitted.length>0&&(
            <div>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500"/>Submitted ({submitted.length})</h3>
              <div className="space-y-3">{submitted.map(a=><Card key={a.id} a={a}/>)}</div>
            </div>
          )}
        </>
      }
    </div>
  );
};
export default StudentAssignments;