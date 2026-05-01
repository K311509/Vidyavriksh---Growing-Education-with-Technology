package com.vidyavriksh.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceResponse {
    private String id;
    private String studentId;
    private String studentName;
    private LocalDate date;
    private String status;
    private String remarks;
    private String subject;
}