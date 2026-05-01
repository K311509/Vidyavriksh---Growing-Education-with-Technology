package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmissionUpdateRequest {
    @NotBlank
    private String studentId;
    @NotBlank
    private String status; // SUBMITTED, PENDING, GRADED
}