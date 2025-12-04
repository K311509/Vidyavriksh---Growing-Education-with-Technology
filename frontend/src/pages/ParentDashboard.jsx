import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award,
  AlertCircle,
  LogOut,
  TrendingUp
} from 'lucide-react';

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const studentsResponse = await api.get('/student');
      const allStudents = studentsResponse.data.data;
      
      const myChildren = allStudents.filter(
        s => s.guardianEmail?.toLowerCase() === user.email?.toLowerCase()
      );
      
      setChildren(myChildren);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

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
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user?.fullName}! 👪
          </h2>
          <p className="text-gray-600">Track your children's academic progress</p>
        </div>

        {/* Children Overview */}
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
            {children.map((child) => (
              <div key={child.id} className="bg-white rounded-2xl shadow-lg p-6">
                {/* Child Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{child.user?.fullName}</h3>
                    <p className="text-gray-600">
                      Class {child.classGrade}-{child.section} • Student ID: {child.studentId}
                    </p>
                  </div>
                  {child.riskLevel && (
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      child.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                      child.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {child.riskLevel} Risk
                    </span>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">Grades</p>
                    <p className="text-gray-600">{child.averageGrade || "N/A"}</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                    <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">Attendance</p>
                    <p className="text-gray-600">{child.attendance || "N/A"}%</p>
                  </div>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">Progress</p>
                    <p className="text-gray-600">{child.progress || "N/A"}</p>
                  </div>
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                    <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">Alerts</p>
                    <p className="text-gray-600">{child.alerts || 0}</p>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="text-right">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
