package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GradeRequest {
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Exam type is required")
    private String examType; // QUIZ, MIDTERM, FINAL, ASSIGNMENT
    
    @NotNull(message = "Score is required")
    private Double score;
    
    @NotNull(message = "Max score is required")
    private Double maxScore;
    
    private String semester;
    private String academicYear;
    private LocalDateTime examDate;
}