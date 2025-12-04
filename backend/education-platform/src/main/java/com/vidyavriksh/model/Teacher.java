package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "teachers")
public class Teacher {
    @Id
    private String id;
    
    @DBRef
    private User user;
    
    private String teacherId;
    private String department;
    private String subject;
    private List<String> qualifications = new ArrayList<>();
    private Integer yearsOfExperience;
    private List<String> classesAssigned = new ArrayList<>();
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}