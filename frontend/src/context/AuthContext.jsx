import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [token,      setToken]      = useState(() => localStorage.getItem("token") || null);
  const [user,       setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });
  const [role,       setRole]       = useState(() => localStorage.getItem("role") || null);
  const [profileId,  setProfileId]  = useState(() => localStorage.getItem("profileId") || null);
  const [validating, setValidating] = useState(true);
 
  // ── On app load: verify stored token is still valid ──────────────────────────
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser  = localStorage.getItem("user");
 
      // No token stored → not logged in, go straight to login
      if (!storedToken || !storedUser) {
        setValidating(false);
        return;
      }
 
      try {
        // /auth/me returns { id, name, role } — just checking it succeeds
        const res  = await api.get("/auth/me");
        const data = res.data;
 
        // Re-hydrate user from /auth/me response so field names are consistent
        const userObj = {
          id:       data.id,
          fullName: data.name,       // /auth/me sends "name" → store as fullName
          role:     data.role?.toString().replace("ROLE_", "").toUpperCase(),
        };
 
        // Sync state + localStorage with fresh data from server
        localStorage.setItem("user", JSON.stringify(userObj));
        setUser(userObj);
        setRole(userObj.role);
        setValidating(false);
 
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403 || status === 400) {
          // Stale/invalid token — clear everything and go to login
          console.warn("Stale session, clearing localStorage");
          localStorage.clear();
          setToken(null);
          setRole(null);
          setProfileId(null);
          setUser(null);
        }
        setValidating(false);
      }
    };
 
    validateSession();
  }, []);
 
  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = async (identifier, password) => {
    try {
      const res  = await api.post("/auth/login", { email: identifier, password });
      const data = res.data;
 
      if (!data || !data.role || !data.token) {
        throw new Error("Invalid login response from server");
      }
 
      // Normalise role — strip ROLE_ prefix if present
      const normalizedRole = data.role.toString().replace("ROLE_", "").toUpperCase();
 
      // Use fullName from login response (AuthService returns fullName via AuthResponse)
      const userObj = {
        id:       data.userId,
        fullName: data.fullName || data.name,   // handle both field names
        role:     normalizedRole,
      };
 
      localStorage.setItem("token",     data.token);
      localStorage.setItem("role",      normalizedRole);
      localStorage.setItem("profileId", data.profileId || "");
      localStorage.setItem("user",      JSON.stringify(userObj));
 
      setToken(data.token);
      setRole(normalizedRole);
      setProfileId(data.profileId || null);
      setUser(userObj);
 
      return userObj;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      throw new Error(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Login failed. Please check your credentials."
      );
    }
  };
 
  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setProfileId(null);
    setUser(null);
  };
 
  // ── Don't render app until session check is done ─────────────────────────────
  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }
 
  return (
    <AuthContext.Provider value={{ token, user, role, profileId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => useContext(AuthContext);
export default api;