package com.vidyavriksh.service;

import com.vidyavriksh.dto.AdminStatistics;
import com.vidyavriksh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AlertRepository alertRepository;

    public AdminStatistics getStatistics() {
        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();
        
        long highRiskStudents = studentRepository.findByRiskLevel("HIGH").size();
        long mediumRiskStudents = studentRepository.findByRiskLevel("MEDIUM").size();
        long lowRiskStudents = studentRepository.findByRiskLevel("LOW").size();
        
        List<com.vidyavriksh.model.Student> allStudents = studentRepository.findAll();
        
        double averageAttendance = allStudents.stream()
                .mapToDouble(s -> s.getAttendancePercentage() != null ? s.getAttendancePercentage() : 0.0)
                .average()
                .orElse(0.0);
        
        double averageGPA = allStudents.stream()
                .mapToDouble(s -> s.getCurrentGPA() != null ? s.getCurrentGPA() : 0.0)
                .average()
                .orElse(0.0);
        
        long activeAlerts = alertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc().size();
        long totalAlerts = alertRepository.count();
        
        return AdminStatistics.builder()
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .highRiskStudents(highRiskStudents)
                .mediumRiskStudents(mediumRiskStudents)
                .lowRiskStudents(lowRiskStudents)
                .averageAttendance(averageAttendance)
                .averageGPA(averageGPA)
                .activeAlerts(activeAlerts)
                .totalAlerts(totalAlerts)
                .build();
    }
}
