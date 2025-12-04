package com.vidyavriksh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AssignmentRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Class grade is required")
    private String classGrade;
    
    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;
    
    @NotNull(message = "Max score is required")
    private Integer maxScore;
    
    private String attachmentUrl;
}