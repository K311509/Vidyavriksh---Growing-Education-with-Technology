import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    phone: '',
    role: 'STUDENT',

    // Student fields
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    classGrade: '',
    section: '',

    // Teacher fields
    department: '',
    subject: '',
    yearsOfExperience: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // -----------------------
  // Handle form submission
  // -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(formData);

      // ROLE FORMAT: ROLE_STUDENT → student
      const role = Array.from(user.roles)[0]
        .replace("ROLE_", "")
        .toLowerCase();

      navigate(`/${role}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Handle input change
  // -----------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">VidyaVriksh</h1>
          </div>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC FIELDS */}
          <div className="grid md:grid-cols-2 gap-4">

            <InputField
              label="Username *"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <InputField
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <InputField
              label="Full Name *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <InputField
              label="Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            <InputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            {/* ROLE SELECT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

          </div>

          {/* STUDENT FIELDS */}
          {formData.role === "STUDENT" && (
            <StudentFields formData={formData} handleChange={handleChange} />
          )}

          {/* TEACHER FIELDS */}
          {formData.role === "TEACHER" && (
            <TeacherFields formData={formData} handleChange={handleChange} />
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 
              text-white py-3 rounded-lg font-semibold 
              hover:from-blue-700 hover:to-indigo-700 transition-all 
              disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

// ------------------------
// Reusable Input Component
// ------------------------
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  minLength,
  placeholder
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// ------------------------
// STUDENT FIELDS COMPONENT
// ------------------------
const StudentFields = ({ formData, handleChange }) => (
  <div className="border-t pt-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">
      Student Information
    </h3>

    <div className="grid md:grid-cols-2 gap-4">

      <InputField
        label="Class/Grade"
        name="classGrade"
        value={formData.classGrade}
        onChange={handleChange}
        placeholder="e.g., 10"
      />

      <InputField
        label="Section"
        name="section"
        value={formData.section}
        onChange={handleChange}
        placeholder="e.g., A"
      />

      <InputField
        label="Guardian Name"
        name="guardianName"
        value={formData.guardianName}
        onChange={handleChange}
      />

      <InputField
        label="Guardian Phone"
        name="guardianPhone"
        value={formData.guardianPhone}
        onChange={handleChange}
      />

      <InputField
        label="Guardian Email"
        name="guardianEmail"
        type="email"
        value={formData.guardianEmail}
        onChange={handleChange}
      />

    </div>
  </div>
);

// ------------------------
// TEACHER FIELDS COMPONENT
// ------------------------
const TeacherFields = ({ formData, handleChange }) => (
  <div className="border-t pt-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">
      Teacher Information
    </h3>

    <div className="grid md:grid-cols-2 gap-4">

      <InputField
        label="Department"
        name="department"
        value={formData.department}
        onChange={handleChange}
      />

      <InputField
        label="Subject"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
      />

      <InputField
        label="Years of Experience"
        name="yearsOfExperience"
        type="number"
        min="0"
        value={formData.yearsOfExperience}
        onChange={handleChange}
      />

    </div>
  </div>
);

export default Register;
