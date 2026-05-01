// ================================================================
// VidyaVriksh MongoDB Seed Data
// Run with: mongosh vidyavriksh seed-data.js
// ================================================================
db.users.insertMany([
  { 
    _id: ObjectId(teacherUserId),
    email: "teacher@test.com",
    username: "teacher@test.com",
    password: BCRYPT_PW,
    fullName: "Priya Sharma",       // ✅ fullName not name
    roles: ["ROLE_TEACHER"],        // ✅ roles array not role string
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: "com.vidyavriksh.model.User"
  },
  { 
    _id: ObjectId(student1UserId),
    email: "student1@test.com",
    username: "student1@test.com",
    password: BCRYPT_PW,
    fullName: "Aarav Mehta",
    roles: ["ROLE_STUDENT"],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: "com.vidyavriksh.model.User"
  },
  { 
    _id: ObjectId(student2UserId),
    email: "student2@test.com",
    username: "student2@test.com",
    password: BCRYPT_PW,
    fullName: "Bhavna Patel",
    roles: ["ROLE_STUDENT"],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: "com.vidyavriksh.model.User"
  },
  { 
    _id: ObjectId(student3UserId),
    email: "student3@test.com",
    username: "student3@test.com",
    password: BCRYPT_PW,
    fullName: "Chirag Verma",
    roles: ["ROLE_STUDENT"],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: "com.vidyavriksh.model.User"
  },
  { 
    _id: ObjectId(parentUserId),
    email: "parent@test.com",
    username: "parent@test.com",
    password: BCRYPT_PW,
    fullName: "Meena Mehta",
    roles: ["ROLE_PARENT"],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: "com.vidyavriksh.model.User"
  },
  { 
    _id: ObjectId(adminUserId),
    email: "admin@test.com",
    username: "admin@test.com",
    password: BCRYPT_PW,
    fullName: "Admin User",
    roles: ["ROLE_ADMIN"],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: "com.vidyavriksh.model.User"
  },
]);

db = db.getSiblingDB("vidyavriksh");

// Clear existing data
db.users.drop(); db.teachers.drop(); db.students.drop();
db.attendance.drop(); db.assignments.drop(); db.grades.drop(); db.alerts.drop();

// ── Users ────────────────────────────────────────────────────────
// Passwords are BCrypt of "password123"
const BCRYPT_PW = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32";

const teacherUserId = new ObjectId().toString();
const student1UserId = new ObjectId().toString();
const student2UserId = new ObjectId().toString();
const student3UserId = new ObjectId().toString();
const parentUserId = new ObjectId().toString();
const adminUserId = new ObjectId().toString();

db.users.insertMany([
  { _id: ObjectId(teacherUserId),  email: "teacher@test.com",  password: BCRYPT_PW, name: "Priya Sharma",   role: "TEACHER", active: true, createdAt: new Date() },
  { _id: ObjectId(student1UserId), email: "student1@test.com", password: BCRYPT_PW, name: "Aarav Mehta",    role: "STUDENT", active: true, createdAt: new Date() },
  { _id: ObjectId(student2UserId), email: "student2@test.com", password: BCRYPT_PW, name: "Bhavna Patel",   role: "STUDENT", active: true, createdAt: new Date() },
  { _id: ObjectId(student3UserId), email: "student3@test.com", password: BCRYPT_PW, name: "Chirag Verma",   role: "STUDENT", active: true, createdAt: new Date() },
  { _id: ObjectId(parentUserId),   email: "parent@test.com",   password: BCRYPT_PW, name: "Meena Mehta",    role: "PARENT",  active: true, createdAt: new Date() },
  { _id: ObjectId(adminUserId),    email: "admin@test.com",    password: BCRYPT_PW, name: "Admin User",     role: "ADMIN",   active: true, createdAt: new Date() },
]);

// ── Teacher ──────────────────────────────────────────────────────
const teacherId = new ObjectId().toString();
db.teachers.insertOne({
  _id: ObjectId(teacherId),
  userId: teacherUserId,
  name: "Priya Sharma",
  email: "teacher@test.com",
  subject: "Mathematics",
  assignedClass: "10",   // ← Must match students' classGrade exactly
  section: "A",          // ← Must match students' section exactly
  phone: "9876543210",
  avatar: "PS"
});

// ── Students ─────────────────────────────────────────────────────
const student1Id = new ObjectId().toString();
const student2Id = new ObjectId().toString();
const student3Id = new ObjectId().toString();

db.students.insertMany([
  {
    _id: ObjectId(student1Id), userId: student1UserId,
    name: "Aarav Mehta", email: "student1@test.com",
    rollNo: 1, classGrade: "10", section: "A",   // ← matches teacher
    parentId: parentUserId,
    gpa: 8.2, attendance: 92, engagement: 75,
    riskScore: 18, riskLevel: "LOW",
    badges: ["Star Performer"], avatar: "AM"
  },
  {
    _id: ObjectId(student2Id), userId: student2UserId,
    name: "Bhavna Patel", email: "student2@test.com",
    rollNo: 2, classGrade: "10", section: "A",
    parentId: null,
    gpa: 4.8, attendance: 58, engagement: 28,
    riskScore: 82, riskLevel: "HIGH",
    badges: [], avatar: "BP"
  },
  {
    _id: ObjectId(student3Id), userId: student3UserId,
    name: "Chirag Verma", email: "student3@test.com",
    rollNo: 3, classGrade: "10", section: "A",
    parentId: null,
    gpa: 6.5, attendance: 74, engagement: 52,
    riskScore: 42, riskLevel: "MEDIUM",
    badges: ["Improver"], avatar: "CV"
  },
]);

print("✅ Seed data inserted successfully!");
print("Login credentials (password for all: password123):");
print("  Teacher : teacher@test.com");
print("  Student1: student1@test.com");
print("  Student2: student2@test.com");
print("  Parent  : parent@test.com");
print("  Admin   : admin@test.com");