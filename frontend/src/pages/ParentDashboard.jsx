import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { batchPredictDropoutRisk } from "../services/mlService";
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  AlertCircle,
  LogOut,
  TrendingUp,
  Loader2,
} from 'lucide-react';

// ── Risk styling helpers ──────────────────────────────────────────────────────
const RISK_BADGE = {
  LOW:    'bg-green-100  text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH:   'bg-red-100    text-red-800',
};

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const [children,     setChildren]     = useState([]);
  const [riskMap,      setRiskMap]      = useState({});   // studentId → ML result
  const [loading,      setLoading]      = useState(true);
  const [riskLoading,  setRiskLoading]  = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  // ── 1. Fetch children from Spring Boot ──────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      const res         = await api.get('/student');
      const allStudents = res.data.data ?? [];

      // Filter to only this parent's children by guardian email
      const myChildren = allStudents.filter(
        (s) => s.guardianEmail?.toLowerCase() === user.email?.toLowerCase()
      );
      setChildren(myChildren);

      // ── 2. Run ML predictions for each child ────────────────────────────────
      if (myChildren.length > 0) {
        setRiskLoading(true);
        const results = await batchPredictDropoutRisk(myChildren);
        const map = {};
        results.forEach((r) => { if (r?.studentId) map[r.studentId] = r; });
        setRiskMap(map);
        setRiskLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading…</div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">VidyaVriksh</h1>
                <p className="text-sm text-gray-600">Parent Portal</p>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user?.fullName}! 👪
          </h2>
          <p className="text-gray-600">Track your children's academic progress</p>
        </div>

        {/* No children */}
        {children.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Children Found</h3>
            <p className="text-gray-500">
              No student profiles are linked to your email address.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {children.map((child) => {
              const sid       = child.studentId;
              const mlRisk    = riskMap[sid];                          // ML result
              const level     = mlRisk?.riskLevel  ?? 'LOW';
              const riskScore = mlRisk?.riskScore   ?? 0;              // 0-100

              // Use correct field names from Spring Boot response
              const attendance = Number(child.attendancePercentage ?? child.attendance ?? 0);
              const gpa        = Number(child.currentGPA ?? child.gpa ?? 0);
              const absences   = Number(child.totalAbsent ?? child.absences ?? 0);

              return (
                <div key={child.id} className="bg-white rounded-2xl shadow-lg p-6">

                  {/* Child header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {child.user?.fullName}
                      </h3>
                      <p className="text-gray-600">
                        Class {child.classGrade}-{child.section} • ID: {child.studentId}
                      </p>
                    </div>

                    {/* ML-powered risk badge */}
                    {riskLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      <span className={`px-4 py-2 rounded-lg font-semibold ${RISK_BADGE[level]}`}>
                        {level} Risk
                      </span>
                    )}
                  </div>

                  {/* ML Risk Score bar */}
                  {!riskLoading && mlRisk && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">Dropout Risk Score</span>
                        <span className={`font-bold ${
                          level === 'HIGH' ? 'text-red-600' :
                          level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                        }`}>{riskScore}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            level === 'HIGH' ? 'bg-red-500' :
                            level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${riskScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats grid — using correct Spring Boot field names */}
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                      <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700">GPA</p>
                      <p className="text-gray-600 text-lg font-bold">
                        {gpa > 0 ? gpa.toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                      <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700">Attendance</p>
                      <p className="text-gray-600 text-lg font-bold">
                        {attendance > 0 ? `${attendance.toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                      <TrendingUp className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700">Absences</p>
                      <p className="text-gray-600 text-lg font-bold">{absences}</p>
                    </div>
                    <div className={`border-2 rounded-lg p-4 text-center ${
                      level === 'HIGH'   ? 'bg-red-50    border-red-200' :
                      level === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                                          'bg-green-50  border-green-200'
                    }`}>
                      <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${
                        level === 'HIGH'   ? 'text-red-600' :
                        level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                      }`}/>
                      <p className="font-semibold text-gray-700">Risk Level</p>
                      <p className={`text-lg font-bold ${
                        level === 'HIGH'   ? 'text-red-600' :
                        level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                      }`}>{level}</p>
                    </div>
                  </div>

                  {/* ML Risk factors (if HIGH/MEDIUM) */}
                  {mlRisk?.riskFactors?.length > 0 &&
                   mlRisk.riskFactors[0] !== 'No significant risk factors' && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-red-800 mb-2">⚠ Risk Factors</p>
                      <div className="flex flex-wrap gap-2">
                        {mlRisk.riskFactors.map((f, i) => (
                          <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;