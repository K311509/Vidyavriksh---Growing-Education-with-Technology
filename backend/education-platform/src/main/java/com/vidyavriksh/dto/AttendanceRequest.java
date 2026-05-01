package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.Map;

@Data
public class AttendanceRequest {
    // Used by original AttendanceService (per-student)
    private String studentId;
    private LocalDate date;
    private String status;
    private String remarks;
    private String subject;

    // Used by TeacherService (bulk class attendance)
    private String teacherId;
    private Map<String, String> records;  // studentId → present/absent/late
}