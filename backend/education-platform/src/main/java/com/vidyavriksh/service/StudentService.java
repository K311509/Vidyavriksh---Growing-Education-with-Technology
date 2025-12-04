package com.vidyavriksh.service;

import com.vidyavriksh.dto.*;
import com.vidyavriksh.exception.ResourceNotFoundException;
import com.vidyavriksh.model.*;
import com.vidyavriksh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final GradeRepository gradeRepository;
    private final AlertRepository alertRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public Student getStudentById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    public Student getStudentByUserId(String userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getStudentsByClass(String classGrade, String section) {
        if (section != null && !section.isEmpty()) {
            return studentRepository.findByClassGradeAndSection(classGrade, section);
        }
        return studentRepository.findByClassGrade(classGrade);
    }

    @Transactional
    public Student updateStudent(String id, StudentUpdateRequest request) {
        Student student = getStudentById(id);
        
        if (request.getClassGrade() != null) {
            student.setClassGrade(request.getClassGrade());
        }
        if (request.getSection() != null) {
            student.setSection(request.getSection());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress());
        }
        if (request.getGuardianName() != null) {
            student.setGuardianName(request.getGuardianName());
        }
        if (request.getGuardianPhone() != null) {
            student.setGuardianPhone(request.getGuardianPhone());
        }
        if (request.getGuardianEmail() != null) {
            student.setGuardianEmail(request.getGuardianEmail());
        }
        if (request.getDateOfBirth() != null) {
            student.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            student.setGender(request.getGender());
        }
        
        log.info("Student updated: {}", student.getStudentId());
        return studentRepository.save(student);
    }

    @Transactional
    public void updateAttendancePercentage(String studentId) {
        Student student = getStudentById(studentId);
        
        List<Attendance> allAttendance = attendanceRepository.findByStudentId(studentId);
        
        if (!allAttendance.isEmpty()) {
            long totalDays = allAttendance.size();
            long presentDays = allAttendance.stream()
                    .filter(a -> "PRESENT".equals(a.getStatus()))
                    .count();
            
            double percentage = (presentDays * 100.0) / totalDays;
            student.setAttendancePercentage(percentage);
            student.setTotalPresent((int) presentDays);
            student.setTotalAbsent((int) (totalDays - presentDays));
            
            studentRepository.save(student);
            log.info("Attendance updated for student: {} - {}%", studentId, percentage);
            
            // Create alert if attendance is low
            if (percentage < 75) {
                createAttendanceAlert(student, percentage);
            }
        }
    }

    @Transactional
    public void updateGPA(String studentId) {
        Student student = getStudentById(studentId);
        
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        
        if (!grades.isEmpty()) {
            double totalPercentage = grades.stream()
                    .mapToDouble(Grade::getPercentage)
                    .sum();
            double gpa = (totalPercentage / grades.size()) / 10.0; // Convert to 10-point scale
            
            student.setCurrentGPA(gpa);
            studentRepository.save(student);
            log.info("GPA updated for student: {} - {}", studentId, gpa);
            
            // Create alert if GPA is low
            if (gpa < 5.0) {
                createGradeAlert(student, gpa);
            }
        }
    }

    public List<Student> getHighRiskStudents() {
        return studentRepository.findByRiskLevel("HIGH");
    }

    public List<Student> getStudentsWithLowAttendance(Double threshold) {
        return studentRepository.findStudentsWithLowAttendance(threshold);
    }

    public StudentDashboardData getDashboardData(String studentId) {
        Student student = getStudentById(studentId);
        
        List<Grade> recentGrades = gradeRepository.findByStudentId(studentId)
                .stream()
                .sorted((g1, g2) -> g2.getCreatedAt().compareTo(g1.getCreatedAt()))
                .limit(10)
                .toList();
        
        List<Attendance> recentAttendance = attendanceRepository
                .findByStudentIdAndDateBetween(studentId, 
                    LocalDate.now().minusMonths(1), LocalDate.now());
        
        List<Alert> activeAlerts = alertRepository
                .findByStudentIdAndAcknowledged(studentId, false);
        
        List<Assignment> upcomingAssignments = assignmentRepository
                .findByClassGrade(student.getClassGrade());
        
        List<Submission> submissions = submissionRepository
                .findByStudentId(studentId);
        
        long pendingSubmissions = upcomingAssignments.stream()
                .filter(assignment -> submissions.stream()
                        .noneMatch(sub -> sub.getAssignment().getId().equals(assignment.getId())))
                .count();
        
        return StudentDashboardData.builder()
                .student(student)
                .recentGrades(recentGrades)
                .recentAttendance(recentAttendance)
                .activeAlerts(activeAlerts)
                .upcomingAssignments(upcomingAssignments.size())
                .pendingSubmissions((int) pendingSubmissions)
                .build();
    }

    @Transactional
    public void addGamificationPoints(String studentId, int points) {
        Student student = getStudentById(studentId);
        student.setGamificationPoints(student.getGamificationPoints() + points);
        studentRepository.save(student);
        log.info("Added {} points to student: {}", points, studentId);
    }

    @Transactional
    public void addBadge(String studentId, String badge) {
        Student student = getStudentById(studentId);
        if (!student.getBadges().contains(badge)) {
            student.getBadges().add(badge);
            studentRepository.save(student);
            log.info("Badge '{}' added to student: {}", badge, studentId);
        }
    }

    private void createAttendanceAlert(Student student, double percentage) {
        Alert alert = new Alert();
        alert.setStudent(student);
        alert.setAlertType("LOW_ATTENDANCE");
        alert.setSeverity(percentage < 50 ? "HIGH" : "MEDIUM");
        alert.setMessage("Low attendance detected");
        alert.setDescription(String.format("Current attendance: %.2f%%", percentage));
        
        alertRepository.save(alert);
        log.info("Attendance alert created for student: {}", student.getStudentId());
    }

    private void createGradeAlert(Student student, double gpa) {
        Alert alert = new Alert();
        alert.setStudent(student);
        alert.setAlertType("POOR_GRADES");
        alert.setSeverity(gpa < 3.0 ? "HIGH" : "MEDIUM");
        alert.setMessage("Low GPA detected");
        alert.setDescription(String.format("Current GPA: %.2f", gpa));
        
        alertRepository.save(alert);
        log.info("Grade alert created for student: {}", student.getStudentId());
    }

    public void deleteStudent(String id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
        log.info("Student deleted: {}", id);
    }
}