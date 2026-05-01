package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class GradeRequest {
    @NotBlank
    private String studentId;
    @NotBlank
    private String subject;
    private String examType;
    @NotNull
    private Double score;
    @NotNull
    private Double maxScore;
    private String semester;
    private String academicYear;
    private LocalDate examDate;
}