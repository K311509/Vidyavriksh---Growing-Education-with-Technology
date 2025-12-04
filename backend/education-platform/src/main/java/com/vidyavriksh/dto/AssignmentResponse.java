package com.vidyavriksh.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AssignmentResponse {
    private String id;
    private String teacherId;
    private String teacherName;
    private String title;
    private String description;
    private String subject;
    private String classGrade;
    private LocalDateTime dueDate;
    private Integer maxScore;
    private String attachmentUrl;
    private LocalDateTime createdAt;
}