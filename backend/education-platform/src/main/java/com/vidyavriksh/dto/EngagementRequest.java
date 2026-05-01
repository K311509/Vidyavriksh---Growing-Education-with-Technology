package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EngagementRequest {
    @NotBlank
    private String studentId;
    @NotNull
    private Integer pointsDelta;
    private String reason;
}