package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BadgeRequest {
    @NotBlank
    private String studentId;
    @NotBlank
    private String badge;
}