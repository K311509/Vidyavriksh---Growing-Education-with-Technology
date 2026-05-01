package com.vidyavriksh.service;

import com.vidyavriksh.model.*;
import com.vidyavriksh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository    studentRepository;
    private final GradeRepository      gradeRepository;
    private final AttendanceRepository attendanceRepository;
    private final AssignmentRepository assignmentRepository;
    private final AlertRepository      alertRepository;
    private final UserRepository       userRepository;

    public List<Student> getAllStudents() {
      return studentRepository.findAll();
    }

    public Student getStudentById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
    }

    public Student getStudentByUserId(String userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student not found for userId: " + userId));
    }

    // Called by AttendanceService after marking attendance
    public void updateAttendancePercentage(String studentId) {
        Student student = getStudentById(studentId);
        List<Attendance> all = attendanceRepository.findByStudentId(studentId);
        if (all.isEmpty()) return;
        long present = all.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
        double pct = (double) present / all.size() * 100;
        student.setAttendancePercentage(Math.round(pct * 10.0) / 10.0);
        student.setTotalPresent((int) present);
        student.setTotalAbsent((int)(all.size() - present));
        studentRepository.save(student);
    }

    // Called by GradeService after adding a grade
    public void updateGPA(String studentId) {
        List<Grade> grades = gradeRepository.findByStudentIdOrderByExamDateDesc(studentId);
        if (grades.isEmpty()) return;
        double avg = grades.stream().mapToDouble(Grade::getPercentage).average().orElse(0);
        double gpa = Math.round((avg / 100.0) * 10.0 * 10.0) / 10.0;
        Student student = getStudentById(studentId);
        student.setCurrentGPA(gpa);
        studentRepository.save(student);
    }

    // Called by GradeService for gamification
    public void addGamificationPoints(String studentId, int points) {
        Student student = getStudentById(studentId);
        int current = student.getGamificationPoints() != null ? student.getGamificationPoints() : 0;
        student.setGamificationPoints(current + points);
        studentRepository.save(student);
    }

    public Map<String, Object> getDashboard(String studentId) {
        Student student = getStudentById(studentId);

        // Grades
        List<Grade> grades = gradeRepository.findByStudentIdOrderByExamDateDesc(studentId);
        List<Map<String, Object>> gradeList = grades.stream().map(g -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("subject",    g.getSubject());
            m.put("examType",   g.getExamType());
            m.put("examDate",   g.getExamDate() != null ? g.getExamDate().toString() : null);
            m.put("score",      g.getScore());
            m.put("maxScore",   g.getMaxScore());
            m.put("percentage", g.getPercentage());
            m.put("grade",      g.getGrade());
            return m;
        }).collect(Collectors.toList());

        // Attendance — your model has @DBRef Student, so query by studentId via DBRef
        List<Attendance> attendanceList = attendanceRepository.findByStudentId(studentId);
        List<Map<String, Object>> recentAttendance = attendanceList.stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .limit(14)
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("date",   a.getDate().toString());
                    m.put("status", a.getStatus());
                    return m;
                }).collect(Collectors.toList());

        // Alerts — @DBRef Student
        List<Alert> alerts = alertRepository.findByStudentId(studentId);
        List<Map<String, Object>> alertList = alerts.stream()
                .filter(al -> !al.isAcknowledged())
                .map(al -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",          al.getId());
                    m.put("message",     al.getMessage());
                    m.put("description", al.getDescription());
                    m.put("severity",    al.getSeverity());
                    m.put("alertType",   al.getAlertType());
                    m.put("createdAt",   al.getCreatedAt().toString());
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("student",          student);
        result.put("recentGrades",     gradeList);
        result.put("recentAttendance", recentAttendance);
        result.put("activeAlerts",     alertList);
        return result;
    }

    // Risk prediction using actual Student fields
    public Map<String, Object> getRiskPrediction(String studentId) {
        Student student = getStudentById(studentId);
        int score = 0;
        List<String> factors         = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        double att = student.getAttendancePercentage() != null ? student.getAttendancePercentage() : 100.0;
        double gpa = student.getCurrentGPA()           != null ? student.getCurrentGPA()           : 0.0;
        int    pts = student.getGamificationPoints()   != null ? student.getGamificationPoints()   : 0;

        if (att < 60)       { score += 40; factors.add("Attendance critically low (" + att + "%)");  recommendations.add("Attend all classes regularly"); }
        else if (att < 75)  { score += 20; factors.add("Attendance below 75%");                      recommendations.add("Improve attendance to at least 75%"); }

        if (gpa < 4.0)      { score += 35; factors.add("GPA critically low (" + gpa + ")");          recommendations.add("Seek academic support from your teacher"); }
        else if (gpa < 6.0) { score += 15; factors.add("GPA below 6.0");                             recommendations.add("Focus on improving your grades"); }

        if (pts < 30)       { score += 25; factors.add("Very low engagement (" + pts + " pts)");     recommendations.add("Participate more in class activities"); }
        else if (pts < 100) { score += 10; factors.add("Below-average engagement");                  recommendations.add("Increase classroom participation"); }

        score = Math.min(100, score);
        String level = score >= 65 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW";

        student.setDropoutRiskScore((double) score);
        student.setRiskLevel(level);
        studentRepository.save(student);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("studentId",       studentId);
        result.put("riskScore",       score);
        result.put("riskLevel",       level);
        result.put("riskFactors",     factors);
        result.put("recommendations", recommendations.isEmpty()
                ? List.of("Keep up the good work!", "Maintain your attendance and grades")
                : recommendations);
        return result;
    }

    public List<Map<String, Object>> getAssignments(String studentId) {
        Student student = getStudentById(studentId);
        return assignmentRepository.findByClassGrade(student.getClassGrade())
                .stream().map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",          a.getId());
                    m.put("title",       a.getTitle());
                    m.put("subject",     a.getSubject());
                    m.put("description", a.getDescription());
                    m.put("dueDate",     a.getDueDate() != null ? a.getDueDate().toString() : null);
                    m.put("myStatus",    "PENDING"); // No submissions map in Assignment model
                    return m;
                }).collect(Collectors.toList());
    }

    public List<Grade> getGrades(String studentId) {
        return gradeRepository.findByStudentIdOrderByExamDateDesc(studentId);
    }

    public List<Map<String, Object>> getAttendance(String studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("date",    a.getDate().toString());
                    m.put("status",  a.getStatus());
                    m.put("subject", a.getSubject());
                    return m;
                }).collect(Collectors.toList());
    }
}