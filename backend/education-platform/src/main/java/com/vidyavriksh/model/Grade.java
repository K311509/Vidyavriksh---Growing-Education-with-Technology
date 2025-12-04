package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Data
@Document(collection = "grades")
public class Grade {
    @Id
    private String id;
    
    @DBRef
    private Student student;
    
    private String subject;
    private String examType; // QUIZ, MIDTERM, FINAL, ASSIGNMENT
    private Double score;
    private Double maxScore;
    private Double percentage;
    private String grade;// A+, A, B+, etc.
    private String semester;
    private String academicYear;
    
    private LocalDateTime examDate;
    private LocalDateTime createdAt = LocalDateTime.now();
}