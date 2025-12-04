package com.vidyavriksh.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeacherStatistics {
    private Long totalStudents;
    private Long totalAssignments;
    private Long pendingSubmissions;
    private Long gradedSubmissions;
    private Double classAverageGPA;
    private Double classAverageAttendance;
    private Long studentsAtRisk;
}