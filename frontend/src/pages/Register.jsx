import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "STUDENT",
    phone: "", subject: "", assignedClass: "", section: "",
    classGrade: "", studentSection: "", rollNo: "",
  });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name:           form.name,
        email:          form.email,
        password:       form.password,
        role:           form.role,
        phone:          form.phone || null,
        // Teacher fields
        subject:        form.subject || null,
        assignedClass:  form.assignedClass || null,
        section:        form.section || null,
        // Student fields
        classGrade:     form.classGrade || null,
        studentSection: form.studentSection || null,
        rollNo:         form.rollNo ? parseInt(form.rollNo) : null,
      };
      const res = await axios.post("http://localhost:8080/api/auth/register", payload);
      // Auto-login after register
      const data = res.data;
      localStorage.setItem("token",     data.token);
      localStorage.setItem("role",      data.role);
      localStorage.setItem("profileId", data.profileId);
      localStorage.setItem("user", JSON.stringify({ id: data.userId, name: data.name, role: data.role }));
      // Route by role
      const routes = { TEACHER: "/teacher/dashboard", STUDENT: "/student/dashboard", PARENT: "/parent/dashboard", ADMIN: "/admin/dashboard" };
      navigate(routes[data.role] || "/login");
    } catch (err) {
      // Show exact backend error message
      const msg = err.response?.data?.error
        || err.response?.data?.message
        || (typeof err.response?.data === "string" ? err.response.data : null)
        || "Registration failed. Please try again.";
      setError(msg);
      console.error("Register error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🌳</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Create Account</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input type="text" required value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="Full Name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
              <select value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none">
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>
          </div>

          {form.role === "TEACHER" && (
            <div className="grid grid-cols-3 gap-3 bg-blue-50 p-4 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
                <input value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  placeholder="Math" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Class</label>
                <input value={form.assignedClass}
                  onChange={e => setForm(p => ({ ...p, assignedClass: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  placeholder="10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Section</label>
                <input value={form.section}
                  onChange={e => setForm(p => ({ ...p, section: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  placeholder="A" />
              </div>
            </div>
          )}

          {form.role === "STUDENT" && (
            <div className="grid grid-cols-3 gap-3 bg-green-50 p-4 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Class</label>
                <input value={form.classGrade}
                  onChange={e => setForm(p => ({ ...p, classGrade: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  placeholder="10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Section</label>
                <input value={form.studentSection}
                  onChange={e => setForm(p => ({ ...p, studentSection: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  placeholder="A" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Roll No</label>
                <input type="number" value={form.rollNo}
                  onChange={e => setForm(p => ({ ...p, rollNo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  placeholder="1" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;