package com.vidyavriksh.service;

import com.vidyavriksh.dto.*;
import com.vidyavriksh.model.*;
import com.vidyavriksh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository       teacherRepository;
    private final StudentRepository       studentRepository;
    private final AttendanceRepository    attendanceRepository;
    private final AssignmentRepository    assignmentRepository;
    private final EngagementLogRepository engagementLogRepository;
    private final AlertRepository         alertRepository;
    private final UserRepository          userRepository;

    // ── Profile ────────────────────────────────────────────────────────────────

    public Teacher getTeacherByUserId(String userId) {
        return teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Teacher not found for userId: " + userId));
    }

    public Teacher getTeacherById(String teacherId) {
        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));
    }

    // ── Students ───────────────────────────────────────────────────────────────

    public List<StudentResponse> getMyStudents(String teacherId) {
        Teacher teacher = getTeacherById(teacherId);
        // Teacher uses assignedSection not section
        String section = teacher.getAssignedSection() != null
                ? teacher.getAssignedSection() : "";
        List<Student> students = studentRepository.findByClassGradeAndSection(
                teacher.getAssignedClass(), section);

        // Enrich with user fullName
        return students.stream().map(s -> {
            StudentResponse r = StudentResponse.from(s);
            userRepository.findById(s.getUserId()).ifPresent(u -> {
                r.setName(u.getFullName());
                r.setEmail(u.getEmail());
            });
            return r;
        }).collect(Collectors.toList());
    }

    // ── Attendance ─────────────────────────────────────────────────────────────
    // Your Attendance model is per-student (@DBRef Student), not bulk class map.
    // Mark attendance = create one Attendance document per student.

    public List<Attendance> markBulkAttendance(String teacherId, AttendanceRequest req) {
        Teacher teacher = getTeacherById(teacherId);
        List<Student> students = studentRepository.findByClassGradeAndSection(
                teacher.getAssignedClass(),
                teacher.getAssignedSection() != null ? teacher.getAssignedSection() : "");
        List<Attendance> saved = new ArrayList<>();

        if (req.getRecords() == null) return saved;

        req.getRecords().forEach((studentId, statusStr) -> {
            Student student = studentRepository.findById(studentId).orElse(null);
            if (student == null) return;
            Attendance a = new Attendance();
            a.setStudent(student);
            a.setDate(req.getDate() != null ? req.getDate() : LocalDate.now());
            a.setStatus(statusStr.toUpperCase());
            saved.add(attendanceRepository.save(a));
        });
        return saved;
    }

    public List<Attendance> getAttendanceHistory(String teacherId) {
        // Attendance model has no teacherId field — return all, frontend filters
        return attendanceRepository.findAll();
    }

    // ── Assignments ────────────────────────────────────────────────────────────

    public Assignment createAssignment(String teacherId, AssignmentRequest req) {
    Teacher teacher = getTeacherById(teacherId);
    Assignment assignment = new Assignment();
    assignment.setTeacherId(teacherId);                          // ✅ String, not @DBRef
    assignment.setTitle(req.getTitle());
    assignment.setSubject(req.getSubject());
    assignment.setDescription(req.getDescription());
    assignment.setClassGrade(teacher.getAssignedClass());
    assignment.setSection(teacher.getAssignedSection());
    assignment.setDueDate(req.getDueDate() != null
            ? req.getDueDate().atStartOfDay() : null);
    return assignmentRepository.save(assignment);
       }

     public List<Assignment> getMyAssignments(String teacherId) {
          List<Assignment> result = assignmentRepository.findByTeacherId(teacherId);
           log.info("Assignments found for teacherId {}: {}", teacherId, result.size());
          return result;
            }
    public void deleteAssignment(String assignmentId, String teacherId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        assignmentRepository.deleteById(assignmentId);
    }

    // ── Engagement ─────────────────────────────────────────────────────────────

    public StudentResponse updateEngagement(String teacherId, EngagementRequest req) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        int current = student.getGamificationPoints() != null ? student.getGamificationPoints() : 0;
        student.setGamificationPoints(Math.max(0, current + req.getPointsDelta()));
        studentRepository.save(student);

        EngagementLog log = new EngagementLog();
        log.setStudentId(req.getStudentId());
        log.setTeacherId(teacherId);
        log.setPointsDelta(req.getPointsDelta());
        log.setReason(req.getReason());
        engagementLogRepository.save(log);

        StudentResponse r = StudentResponse.from(student);
        userRepository.findById(student.getUserId()).ifPresent(u -> {
            r.setName(u.getFullName()); r.setEmail(u.getEmail());
        });
        return r;
    }

    public StudentResponse awardBadge(String teacherId, BadgeRequest req) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (!student.getBadges().contains(req.getBadge()))
            student.getBadges().add(req.getBadge());
        studentRepository.save(student);
        StudentResponse r = StudentResponse.from(student);
        userRepository.findById(student.getUserId()).ifPresent(u -> r.setName(u.getFullName()));
        return r;
    }

    public StudentResponse removeBadge(String teacherId, BadgeRequest req) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.getBadges().remove(req.getBadge());
        studentRepository.save(student);
        StudentResponse r = StudentResponse.from(student);
        userRepository.findById(student.getUserId()).ifPresent(u -> r.setName(u.getFullName()));
        return r;
    }

    // ── Risk ───────────────────────────────────────────────────────────────────

    public List<StudentResponse> getStudentsByRisk(String teacherId, String riskLevel) {
        Teacher teacher = getTeacherById(teacherId);
        List<Student> all = studentRepository.findByClassGradeAndSection(
                teacher.getAssignedClass(),
                teacher.getAssignedSection() != null ? teacher.getAssignedSection() : "");
        if (riskLevel != null && !riskLevel.equalsIgnoreCase("ALL")) {
            all = all.stream()
                    .filter(s -> riskLevel.equalsIgnoreCase(s.getRiskLevel()))
                    .collect(Collectors.toList());
        }
        return all.stream().map(s -> {
            StudentResponse r = StudentResponse.from(s);
            userRepository.findById(s.getUserId()).ifPresent(u -> r.setName(u.getFullName()));
            return r;
        }).collect(Collectors.toList());
    }

    // ── Alerts ─────────────────────────────────────────────────────────────────

    public List<Alert> getAlerts(String teacherId) {
        return alertRepository.findByTeacherIdAndAcknowledgedFalseOrderByCreatedAtDesc(teacherId);
    }
}