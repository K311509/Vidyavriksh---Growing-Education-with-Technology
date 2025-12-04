import React from 'react';
import { Users, AlertTriangle, Calendar, Award, TrendingUp } from 'lucide-react';

const QuickStats = ({ stats }) => {
  const statCards = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      color: 'blue',
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      label: 'High Risk',
      value: stats?.highRiskStudents || 0,
      color: 'red',
    },
    {
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      label: 'Avg Attendance',
      value: `${(stats?.averageAttendance || 0).toFixed(1)}%`,
      color: 'green',
    },
    {
      icon: <Award className="w-6 h-6 text-purple-600" />,
      label: 'Avg GPA',
      value: (stats?.averageGPA || 0).toFixed(2),
      color: 'purple',
    },
  ];

  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {statCards.map((stat, idx) => (
        <div key={idx} className={`${colors[stat.color]} border-2 rounded-xl p-6 hover:shadow-lg transition`}>
          <div className="flex items-center justify-between mb-3">
            {stat.icon}
          </div>
          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;