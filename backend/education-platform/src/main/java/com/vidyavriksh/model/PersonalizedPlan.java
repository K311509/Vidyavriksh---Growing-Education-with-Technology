package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "personalized_plans")
public class PersonalizedPlan {
    @Id
    private String id;
    
    @DBRef
    private Student student;
    
    private String title;
    private String description;
    private List<String> goals = new ArrayList<>();
    private List<String> recommendedResources = new ArrayList<>();
    private String status; // ACTIVE, COMPLETED, PAUSED
    private Integer progressPercentage = 0;
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}