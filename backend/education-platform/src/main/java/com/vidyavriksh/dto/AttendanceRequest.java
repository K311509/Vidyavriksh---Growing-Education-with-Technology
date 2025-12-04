package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceRequest {
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotBlank(message = "Status is required")
    private String status; // PRESENT, ABSENT, LATE, EXCUSED
    
    private String remarks;
    private String subject;
}