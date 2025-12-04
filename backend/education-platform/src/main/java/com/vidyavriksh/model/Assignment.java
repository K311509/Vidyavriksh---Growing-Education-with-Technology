package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Data
@Document(collection = "assignments")
public class Assignment {
    @Id
    private String id;
    
    @DBRef
    private Teacher teacher;
    
    private String title;
    private String description;
    private String subject;
    private String classGrade;
    private LocalDateTime dueDate;
    private Integer maxScore;
    private String attachmentUrl;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}