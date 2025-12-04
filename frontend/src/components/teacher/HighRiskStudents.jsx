import React from 'react';
import { AlertTriangle, TrendingDown, Phone, Mail } from 'lucide-react';

const HighRiskStudents = ({ students }) => {
  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No High-Risk Students</h3>
        <p className="text-gray-500">All students are performing well! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingDown className="w-6 h-6 text-red-500" />
        High Risk Students ({students.length})
      </h3>

      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-800 text-lg">
                  {student.user?.fullName}
                </h4>
                <p className="text-sm text-gray-600">
                  {student.studentId} • Class {student.classGrade}-{student.section}
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                  {((student.dropoutRiskScore || 0) * 100).toFixed(0)}% Risk
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Attendance</p>
                <p className="text-lg font-bold text-gray-800">
                  {(student.attendancePercentage || 0).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">GPA</p>
                <p className="text-lg font-bold text-gray-800">
                  {student.currentGPA?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Absences</p>
                <p className="text-lg font-bold text-gray-800">
                  {student.totalAbsent || 0}
                </p>
              </div>
            </div>

            {/* Risk Factors */}
            {student.riskFactors && student.riskFactors.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Risk Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {student.riskFactors.map((factor, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Guardian Contact */}
            <div className="flex gap-2 text-sm">
              <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">
                <Phone className="w-3 h-3" />
                <span>Call Guardian</span>
              </button>
              <button className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                <Mail className="w-3 h-3" />
                <span>Email Guardian</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HighRiskStudents;