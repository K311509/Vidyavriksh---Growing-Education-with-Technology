import React from 'react';
import { Users, AlertCircle, TrendingDown, Award } from 'lucide-react';

const StudentList = ({ students, onSelectStudent }) => {
  const getRiskBadge = (riskLevel) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800',
    };
    return colors[riskLevel] || 'bg-gray-100 text-gray-800';
  };

  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Found</h3>
        <p className="text-gray-500">No students are assigned to your class yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        All Students ({students.length})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attendance</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">GPA</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Points</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Risk Level</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm text-gray-800 font-mono">
                  {student.studentId}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{student.user?.fullName}</p>
                    <p className="text-xs text-gray-500">{student.user?.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  {student.classGrade}-{student.section}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      (student.attendancePercentage || 0) >= 80 ? 'bg-green-500' :
                      (student.attendancePercentage || 0) >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-gray-800">
                      {(student.attendancePercentage || 0).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">
                  {student.currentGPA?.toFixed(2) || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-800">{student.gamificationPoints || 0}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadge(student.riskLevel)}`}>
                    {student.riskLevel || 'LOW'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => onSelectStudent && onSelectStudent(student)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;