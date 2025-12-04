import React from 'react';
import { AlertCircle, TrendingUp, Award, Calendar, Trophy, BookOpen } from 'lucide-react';

const DashboardHome = ({ data, riskPrediction }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  const { student, recentGrades, recentAttendance, activeAlerts } = data;

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {student?.user?.fullName}! 👋
        </h1>
        <p className="text-blue-100">
          Class {student?.classGrade}-{student?.section} • Student ID: {student?.studentId}
        </p>
      </div>

      {/* Active Alerts */}
      {activeAlerts?.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-2">
                You have {activeAlerts.length} active alert(s)
              </h3>
              {activeAlerts.map((alert, idx) => (
                <p key={idx} className="text-sm text-red-700 mb-1">
                  • {alert.message}: {alert.description}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          icon={<Award className="w-6 h-6 text-blue-600" />}
          label="Current GPA"
          value={student?.currentGPA?.toFixed(2) || 'N/A'}
          subtitle="Out of 10.0"
          color="blue"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-green-600" />}
          label="Attendance"
          value={`${student?.attendancePercentage?.toFixed(1) || 0}%`}
          subtitle={`${student?.totalPresent || 0} days present`}
          color="green"
        />
        <StatCard
          icon={<Trophy className="w-6 h-6 text-purple-600" />}
          label="Points"
          value={student?.gamificationPoints || 0}
          subtitle="Gamification points"
          color="purple"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-yellow-600" />}
          label="Badges"
          value={student?.badges?.length || 0}
          subtitle="Achievements earned"
          color="yellow"
        />
      </div>

      {/* Risk Assessment */}
      {riskPrediction && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Dropout Risk Assessment
          </h3>
          <div className="space-y-4">
            <div>
              <div className={`inline-block px-4 py-2 rounded-lg border-2 ${getRiskColor(riskPrediction.riskLevel)} font-semibold`}>
                Risk Level: {riskPrediction.riskLevel}
              </div>
              <p className="text-gray-600 mt-2">
                Risk Score: <span className="font-semibold">{(riskPrediction.riskScore * 100).toFixed(1)}%</span>
              </p>
            </div>

            {riskPrediction.riskFactors?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Risk Factors:</h4>
                <ul className="space-y-1">
                  {riskPrediction.riskFactors.map((factor, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {riskPrediction.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {riskPrediction.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-start">
                      <span className="text-blue-500 mr-2">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Grades */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Grades</h3>
        {recentGrades?.length > 0 ? (
          <div className="space-y-3">
            {recentGrades.slice(0, 5).map((grade, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div>
                  <p className="font-semibold text-gray-800">{grade.subject}</p>
                  <p className="text-sm text-gray-500">{grade.examType}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{grade.grade}</p>
                  <p className="text-sm text-gray-500">
                    {grade.score}/{grade.maxScore} ({grade.percentage?.toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No grades available yet</p>
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Attendance</h3>
        {recentAttendance?.length > 0 ? (
          <div className="grid grid-cols-7 gap-2">
            {recentAttendance.slice(0, 14).map((attendance, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-center ${
                  attendance.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                  attendance.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                  attendance.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                <p className="text-xs font-semibold">
                  {new Date(attendance.date).getDate()}
                </p>
                <p className="text-xs">{attendance.status.charAt(0)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No attendance records yet</p>
          </div>
        )}
      </div>

      {/* Badges Display */}
      {student?.badges?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Badges</h3>
          <div className="flex flex-wrap gap-3">
            {student.badges.map((badge, idx) => (
              <div key={idx} className="bg-yellow-50 border-2 border-yellow-300 rounded-lg px-4 py-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, subtitle, color }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div className={`${colors[color]} border-2 rounded-xl p-6 hover:shadow-lg transition`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
};

export default DashboardHome;