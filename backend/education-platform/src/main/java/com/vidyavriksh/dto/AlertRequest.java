package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AlertRequest {
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotBlank(message = "Alert type is required")
    private String alertType; // DROPOUT_RISK, LOW_ATTENDANCE, POOR_GRADES, BEHAVIORAL
    
    @NotBlank(message = "Severity is required")
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    
    @NotBlank(message = "Message is required")
    private String message;
    
    private String description;
}