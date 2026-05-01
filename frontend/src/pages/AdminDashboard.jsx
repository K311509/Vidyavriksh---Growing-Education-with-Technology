import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { predictDropoutRisk } from "../services/mlService";
import {
  BookOpen,
  Users,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  LogOut,
  Activity,
  Loader2,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [statistics,   setStatistics]   = useState(null);
  const [students,     setStudents]     = useState([]);   // raw from Spring Boot
  const [mlStudents,   setMlStudents]   = useState([]);   // enriched with ML risk
  const [loading,      setLoading]      = useState(true);
  const [mlLoading,    setMlLoading]    = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats + student list from Spring Boot in parallel
      const [statsRes, studentsRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/student'),
      ]);

      const statsData   = statsRes.data.data    ?? {};
      const studentList = studentsRes.data.data ?? [];

      setStatistics(statsData);
      setStudents(studentList);

      // ── Run ML batch prediction on ALL students ──────────────────────────────
      if (studentList.length > 0) {
        setMlLoading(true);
        const predictions = await batchPredictDropoutRisk(studentList);

        // Build lookup map: studentId → ML result
        const mlMap = {};
        predictions.forEach((p) => { if (p?.studentId) mlMap[p.studentId] = p; });

        // Merge ML results into student objects
        const enriched = studentList.map((s) => {
          const ml = mlMap[s.studentId] ?? {};
          return {
            ...s,
            riskLevel:  ml.riskLevel  ?? s.riskLevel  ?? 'LOW',
            riskScore:  ml.riskScore  ?? 0,                      // 0-100
            riskFactors: ml.riskFactors ?? [],
          };
        });

        setMlStudents(enriched);
        setMlLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading…</div>
      </div>
    );
  }

  // ── Risk counts from ML predictions (not Spring Boot statistics) ─────────────
  const displayStudents = mlStudents.length > 0 ? mlStudents : students;

  const mlLow    = displayStudents.filter((s) => s.riskLevel === 'LOW').length;
  const mlMedium = displayStudents.filter((s) => s.riskLevel === 'MEDIUM').length;
  const mlHigh   = displayStudents.filter((s) => s.riskLevel === 'HIGH').length;

  // ── Chart data ───────────────────────────────────────────────────────────────
  const riskDistributionData = [
    { name: 'Low Risk',    value: mlLow,    color: '#10B981' },
    { name: 'Medium Risk', value: mlMedium, color: '#F59E0B' },
    { name: 'High Risk',   value: mlHigh,   color: '#EF4444' },
  ];

  const avgAttendance = statistics?.averageAttendance ?? 0;
  const avgGPA        = statistics?.averageGPA        ?? 0;

  const performanceData = [
    { name: 'Attendance', value: Number(avgAttendance.toFixed(1)) },
    { name: 'GPA (×10)',  value: Number((avgGPA * 10).toFixed(1)) },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">VidyaVriksh</h1>
                <p className="text-sm text-gray-600">Admin Portal</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Welcome */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">System Overview 📊</h2>
          <p className="text-gray-600">Monitor and manage the entire platform</p>
        </div>

        {/* ML loading banner */}
        {mlLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-blue-700 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running ML dropout analysis on all students…
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6 text-blue-600" />}
            label="Total Students"
            value={statistics?.totalStudents ?? displayStudents.length}
            color="blue"
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6 text-green-600" />}
            label="Total Teachers"
            value={statistics?.totalTeachers ?? 0}
            color="green"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
            label="High Risk Students"
            value={mlLoading ? '…' : mlHigh}
            color="red"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-purple-600" />}
            label="Avg Attendance"
            value={avgAttendance > 0 ? `${avgAttendance.toFixed(1)}%` : 'N/A'}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Risk Distribution — powered by ML */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              Risk Distribution
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {mlLoading ? 'Calculating via ML model…' : 'Powered by ML dropout model'}
            </p>
            {mlLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Performance Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Average Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Breakdown Cards — ML-powered counts */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-green-800 mb-2">Low Risk</h4>
            <p className="text-4xl font-bold text-green-600">
              {mlLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : mlLow}
            </p>
            <p className="text-sm text-green-700 mt-2">Students performing well</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">Medium Risk</h4>
            <p className="text-4xl font-bold text-yellow-600">
              {mlLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : mlMedium}
            </p>
            <p className="text-sm text-yellow-700 mt-2">Need monitoring</p>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-red-800 mb-2">High Risk</h4>
            <p className="text-4xl font-bold text-red-600">
              {mlLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : mlHigh}
            </p>
            <p className="text-sm text-red-700 mt-2">Require immediate attention</p>
          </div>
        </div>

        {/* Students Table — risk from ML */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent Students</h3>
            {mlLoading && (
              <span className="text-xs text-blue-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Updating risk scores…
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attendance</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">GPA</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ML Risk Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayStudents.slice(0, 10).map((student) => {
                  const level = student.riskLevel ?? 'LOW';
                  const score = student.riskScore  ?? 0;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{student.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{student.user?.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{student.classGrade}-{student.section}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {student.attendancePercentage?.toFixed(1) ?? 'N/A'}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {student.currentGPA?.toFixed(2) ?? 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {mlLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-16">
                              <div
                                className={`h-full rounded-full ${
                                  level === 'HIGH'   ? 'bg-red-500' :
                                  level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{score}%</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          level === 'LOW'    ? 'bg-green-100  text-green-800'  :
                          level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100    text-red-800'
                        }`}>
                          {level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// ── Reusable stat card ────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue:   'bg-blue-50   border-blue-200',
    green:  'bg-green-50  border-green-200',
    red:    'bg-red-50    border-red-200',
    purple: 'bg-purple-50 border-purple-200',
  };
  return (
    <div className={`${colors[color]} border-2 rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default AdminDashboard;