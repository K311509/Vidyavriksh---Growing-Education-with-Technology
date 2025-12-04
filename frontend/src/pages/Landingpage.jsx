import React from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, Shield, GraduationCap } from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: <GraduationCap className="w-10 h-10 text-white" />,
      title: "Student Dashboard",
      description: "Track performance, get early warnings for dropout risks, and access personalized resources.",
    },
    {
      icon: <Users className="w-10 h-10 text-white" />,
      title: "Teacher Dashboard",
      description: "Monitor students’ progress, assign tasks, and provide timely feedback.",
    },
    {
      icon: <BookOpen className="w-10 h-10 text-white" />,
      title: "Parent Dashboard",
      description: "Stay informed about your child's performance and receive notifications.",
    },
    {
      icon: <Shield className="w-10 h-10 text-white" />,
      title: "Admin Panel",
      description: "Manage students, teachers, and overall portal settings efficiently.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 flex flex-col">
      
    
      {/* Header */}
<header className="flex justify-between items-center p-6 bg-white shadow-md">
  <h1 className="text-2xl font-bold text-blue-600">Vidyavriksh Portal</h1>
  
  {/* Login & Register Buttons Side by Side */}
  <div className="flex gap-4">
    <Link
      to="/login"
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
    >
      Login
    </Link>
    <Link
      to="/register"
      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
    >
      Register
    </Link>
  </div>
</header>


      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
         Vidyavriksh-Growing Knowledge, Nurturing Futures
        </h2>
        <p className="text-gray-600 max-w-2xl mb-8">
          An integrated platform to help students, teachers, and parents track learning,
          reduce dropout risks, and improve overall performance.
        </p>
        
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-6">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
         Presents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-blue-600 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition"
            >
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-white text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center py-6 mt-auto">
        &copy; {new Date().getFullYear()} Vidyavriksh Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
