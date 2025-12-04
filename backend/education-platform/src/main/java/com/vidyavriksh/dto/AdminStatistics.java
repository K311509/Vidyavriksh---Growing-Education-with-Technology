package com.vidyavriksh.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatistics {
    private Long totalStudents;
    private Long totalTeachers;
    private Long highRiskStudents;
    private Long mediumRiskStudents;
    private Long lowRiskStudents;
    private Double averageAttendance;
    private Double averageGPA;
    private Long activeAlerts;
    private Long totalAlerts;
}