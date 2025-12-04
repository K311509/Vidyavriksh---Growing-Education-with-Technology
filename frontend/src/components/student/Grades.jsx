import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, TrendingUp, BookOpen } from 'lucide-react';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      const studentResponse = await api.get(`/student/user/${user.id}`);
      const studentId = studentResponse.data.data.id;
      
      const gradesResponse = await api.get(`/grades/student/${studentId}`);
      const gradesData = gradesResponse.data.data;
      
      setGrades(gradesData);
      
      // Extract unique subjects
      const uniqueSubjects = [...new Set(gradesData.map(g => g.subject))];
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = filter === 'all' 
    ? grades 
    : grades.filter(g => g.subject === filter);

  const averagePercentage = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(1)
    : 0;

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="text-center py-12">Loading grades...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Grades</h2>
        <p className="text-gray-600">View your academic performance</p>
      </div>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-blue-600" />
            <p className="text-sm text-gray-600">Total Grades</p>
          </div>
          <p className="text-4xl font-bold text-gray-800">{grades.length}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <p className="text-sm text-gray-600">Average</p>
          </div>
          <p className="text-4xl font-bold text-green-800">{averagePercentage}%</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <p className="text-sm text-gray-600">Subjects</p>
          </div>
          <p className="text-4xl font-bold text-purple-800">{subjects.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((subject, idx) => (
            <button
              key={idx}
              onClick={() => setFilter(subject)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === subject ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Grades List */}
        {filteredGrades.length > 0 ? (
          <div className="space-y-3">
            {filteredGrades.map((grade, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border-l-4"
                style={{
                  borderLeftColor: grade.percentage >= 80 ? '#10B981' : 
                                   grade.percentage >= 60 ? '#F59E0B' : '#EF4444'
                }}
              >
                <div>
                  <p className="font-bold text-gray-800">{grade.subject}</p>
                  <p className="text-sm text-gray-600">{grade.examType}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(grade.examDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getGradeColor(grade.percentage)}`}>
                    {grade.grade}
                  </p>
                  <p className="text-sm text-gray-600">
                    {grade.score}/{grade.maxScore}
                  </p>
                  <p className="text-xs text-gray-500">
                    {grade.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No grades available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;