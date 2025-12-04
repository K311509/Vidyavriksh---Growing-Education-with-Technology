package com.vidyavriksh.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AlertResponse {
    private String id;
    private String studentId;
    private String studentName;
    private String alertType;
    private String severity;
    private String message;
    private String description;
    private boolean acknowledged;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime createdAt;
}