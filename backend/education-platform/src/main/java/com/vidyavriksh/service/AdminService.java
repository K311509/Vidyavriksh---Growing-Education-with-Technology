package com.vidyavriksh.service;

import com.vidyavriksh.dto.AdminStatistics;
import com.vidyavriksh.model.Student;
import com.vidyavriksh.repository.AlertRepository;
import com.vidyavriksh.repository.StudentRepository;
import com.vidyavriksh.repository.TeacherRepository;
import com.vidyavriksh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AlertRepository   alertRepository;
    private final UserRepository    userRepository;

    public AdminStatistics getStatistics() {
        long totalStudents  = studentRepository.count();
        long totalTeachers  = teacherRepository.count();

        // riskLevel is a String field in Student model ("LOW", "MEDIUM", "HIGH")
        long highRisk   = studentRepository.findByRiskLevel("HIGH").size();
        long mediumRisk = studentRepository.findByRiskLevel("MEDIUM").size();
        long lowRisk    = studentRepository.findByRiskLevel("LOW").size();

        List<Student> all = studentRepository.findAll();

        double avgAttendance = all.stream()
                .mapToDouble(s -> s.getAttendancePercentage() != null ? s.getAttendancePercentage() : 0.0)
                .average().orElse(0.0);

        double avgGPA = all.stream()
                .mapToDouble(s -> s.getCurrentGPA() != null ? s.getCurrentGPA() : 0.0)
                .average().orElse(0.0);

        long activeAlerts = alertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc().size();
        long totalAlerts  = alertRepository.count();

        return AdminStatistics.builder()
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .highRiskStudents(highRisk)
                .mediumRiskStudents(mediumRisk)
                .lowRiskStudents(lowRisk)
                .averageAttendance(avgAttendance)
                .averageGPA(avgGPA)
                .activeAlerts(activeAlerts)
                .totalAlerts(totalAlerts)
                .build();
    }

    public List<Map<String, Object>> getAllUsers() {
        var users = userRepository.findAll();
        return users.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",     u.getId());
            m.put("name",   u.getFullName());
            m.put("email",  u.getEmail());
            m.put("role",   u.getRoles().stream().findFirst().map(Enum::name).orElse("UNKNOWN"));
            m.put("active", u.isActive());
            return m;
        }).collect(java.util.stream.Collectors.toList());
    }

    public void toggleUserStatus(String userId, boolean active) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setActive(active);
            userRepository.save(u);
        });
    }
}