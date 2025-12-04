package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "learning_resources")
public class LearningResource {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String type; // VIDEO, ARTICLE, QUIZ, DOCUMENT
    private String subject;
    private String gradeLevel;
    private String url;
    private String thumbnailUrl;
    private List<String> tags = new ArrayList<>();
    private Integer duration; // in minutes
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    
    private LocalDateTime createdAt = LocalDateTime.now();
}