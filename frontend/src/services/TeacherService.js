import api from "./api";

export const getTeacher = (teacherId, token) =>
  fetch(`/api/teacher/${teacherId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());

export const getStudents = (teacherId, token) =>
  fetch(`/api/teacher/${teacherId}/students`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());

export const markAttendance = async (studentId, present) => {
  const res = await api.post("/teacher/attendance", null, {
    params: { studentId, present }
  });
  return res.data;
};

export const addPoints = async (studentId, points) => {
  const res = await api.post("/teacher/points", null, {
    params: { studentId, points }
  });
  return res.data;
};

export const addBadge = async (studentId, badge) => {
  const res = await api.post("/teacher/badge", null, {
    params: { studentId, badge }
  });
  return res.data;
};