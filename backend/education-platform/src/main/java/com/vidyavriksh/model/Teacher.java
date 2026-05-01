package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "teachers")
public class Teacher {

    @Id
    private String id;

    private String userId;

    private String teacherId;
    private String department;
    private String subject;

    private String assignedClass;   // "10"
    private String assignedSection; // "A"

    private Integer yearsOfExperience;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}