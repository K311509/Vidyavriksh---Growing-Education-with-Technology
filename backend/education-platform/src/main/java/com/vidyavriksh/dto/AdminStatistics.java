package com.vidyavriksh.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatistics {
    private long totalStudents;
    private long totalTeachers;
    private long highRiskStudents;
    private long mediumRiskStudents;
    private long lowRiskStudents;
    private double averageAttendance;
    private double averageGPA;
    private long activeAlerts;
    private long totalAlerts;
}