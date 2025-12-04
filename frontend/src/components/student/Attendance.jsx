import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, present, absent

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      // Get student profile
      const studentResponse = await api.get(`/student/user/${user.id}`);
      const studentId = studentResponse.data.data.id;
      
      // Get attendance records
      const attendanceResponse = await api.get(`/attendance/student/${studentId}`);
      setAttendanceData(attendanceResponse.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ABSENT': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'LATE': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'EXCUSED': return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-50 border-green-200 text-green-800';
      case 'ABSENT': return 'bg-red-50 border-red-200 text-red-800';
      case 'LATE': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'EXCUSED': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const filteredData = attendanceData.filter(record => {
    if (filter === 'all') return true;
    return record.status.toLowerCase() === filter;
  });

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(r => r.status === 'PRESENT').length,
    absent: attendanceData.filter(r => r.status === 'ABSENT').length,
    late: attendanceData.filter(r => r.status === 'LATE').length,
  };

  const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  if (loading) {
    return <div className="text-center py-12">Loading attendance records...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Records</h2>
        <p className="text-gray-600">Track your daily attendance</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Total Days</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Present</p>
          <p className="text-3xl font-bold text-green-800">{stats.present}</p>
          <p className="text-xs text-green-600">{percentage}%</p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Absent</p>
          <p className="text-3xl font-bold text-red-800">{stats.absent}</p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Late</p>
          <p className="text-3xl font-bold text-yellow-800">{stats.late}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'present' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Absent
          </button>
        </div>

        {/* Attendance List */}
        {filteredData.length > 0 ? (
          <div className="space-y-3">
            {filteredData.map((record, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center p-4 border-2 rounded-lg ${getStatusColor(record.status)}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-semibold">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {record.subject && (
                      <p className="text-sm opacity-75">{record.subject}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold">{record.status}</span>
                  {record.remarks && (
                    <p className="text-xs opacity-75">{record.remarks}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;