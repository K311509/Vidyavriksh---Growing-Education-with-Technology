import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserCircle, BookOpen, Users, Shield, GraduationCap } from "lucide-react";

const Login = () => {
  const [role, setRole] = useState("student");   // default
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    console.log("Role:", role);
    console.log("Identifier:", identifier);
    console.log("Password:", password);

    // Example: Redirect based on role
    // if (role === "student") navigate("/student/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
        {/* Back Button */}
        <Link to="/" className="text-blue-600 hover:underline flex items-center mb-4">
          ← Back to Home
        </Link>

        {/* Title */}
        <div className="text-center mb-6">
          <UserCircle className="w-14 h-14 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Login</h1>
          <p className="text-gray-600 mt-1">Select your role and enter your credentials</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <RoleButton
            label="Student"
            value="student"
            selected={role}
            onClick={() => setRole("student")}
            icon={<GraduationCap className="w-6 h-6" />}
          />
          <RoleButton
            label="Teacher"
            value="teacher"
            selected={role}
            onClick={() => setRole("teacher")}
            icon={<Users className="w-6 h-6" />}
          />
          <RoleButton
            label="Parent"
            value="parent"
            selected={role}
            onClick={() => setRole("parent")}
            icon={<BookOpen className="w-6 h-6" />}
          />
          <RoleButton
            label="Admin"
            value="admin"
            selected={role}
            onClick={() => setRole("admin")}
            icon={<Shield className="w-6 h-6" />}
          />
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* ID / Email Field */}
          <div>
            <label className="block text-gray-700 mb-1">
              {role === "student" ? "Student ID" 
              : role === "teacher" ? "Teacher Email"
              : role === "parent" ? "Parent Email"
              : "Admin Username"}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder={
                role === "student"
                  ? "Enter Student ID"
                  : "Enter Email / Username"
              }
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <Link
            to="/ForgotPassword"
            className="inline-block text-blue-600 font-medium hover:text-blue-800 transition"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

const RoleButton = ({ label, value, selected, onClick, icon }) => {
  const isActive = selected === value;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition ${
        isActive
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
};

export default Login;
