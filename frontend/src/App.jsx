import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard";
import LandingPage from "./pages/Landingpage";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} /> 
          {/* Registration Page */}
          <Route path="/register" element={<Register />} />
          {/* Teacher Dashboard */}
          <Route path="/Teacher/dashboard" element={<TeacherDashboard />} />
          {/*parent Dashboard */}
          <Route path="/parent/dashboard" element={<ParentDashboard />} />  
          {/*Admin Dashboard */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* General Login Page */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Student Dashboard */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
