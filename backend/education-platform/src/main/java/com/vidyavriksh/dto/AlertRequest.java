package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AlertRequest {
    @NotBlank
    private String studentId;
    @NotBlank
    private String alertType;
    @NotBlank
    private String severity;
    @NotBlank
    private String message;
    private String description;
}