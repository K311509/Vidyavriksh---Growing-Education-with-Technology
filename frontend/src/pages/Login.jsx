import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCircle, BookOpen, Users, Shield, GraduationCap } from "lucide-react";

const ROUTE_MAP = {
  STUDENT: "/student/dashboard",
  TEACHER: "/teacher/dashboard",
  PARENT:  "/parent/dashboard",
  ADMIN:   "/admin/dashboard",
};

const Login = () => {
  const [selectedRole, setSelectedRole] = useState("student");
  const [identifier,   setIdentifier]   = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(identifier, password);

      if (!user || !user.role) {
        setError("Role not found. Contact admin.");
        return;
      }

      // user.role is already normalised to uppercase in AuthContext
      const route = ROUTE_MAP[user.role];

      if (!route) {
        setError(`Unknown role: ${user.role}`);
        return;
      }

      navigate(route);

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">

        <Link to="/" className="text-blue-600 hover:underline flex items-center mb-4">
          ← Back to Home
        </Link>

        <div className="text-center mb-6">
          <UserCircle className="w-14 h-14 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Login</h1>
          <p className="text-gray-600 mt-1">Select your role and enter your credentials</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Role selector — visual only, actual role comes from server response */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <RoleButton label="Student" value="student" selected={selectedRole} onClick={() => setSelectedRole("student")} icon={<GraduationCap className="w-6 h-6" />} />
          <RoleButton label="Teacher" value="teacher" selected={selectedRole} onClick={() => setSelectedRole("teacher")} icon={<Users className="w-6 h-6" />} />
          <RoleButton label="Parent"  value="parent"  selected={selectedRole} onClick={() => setSelectedRole("parent")}  icon={<BookOpen className="w-6 h-6" />} />
          <RoleButton label="Admin"   value="admin"   selected={selectedRole} onClick={() => setSelectedRole("admin")}   icon={<Shield className="w-6 h-6" />} />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in…" : `Login as ${selectedRole}`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>

      </div>
    </div>
  );
};

const RoleButton = ({ label, value, selected, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition ${
      selected === value ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

export default Login;