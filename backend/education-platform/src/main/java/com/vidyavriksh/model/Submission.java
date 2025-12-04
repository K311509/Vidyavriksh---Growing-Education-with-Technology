package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Data
@Document(collection = "submissions")
public class Submission {
    @Id
    private String id;
    
    @DBRef
    private Assignment assignment;
    
    @DBRef
    private Student student;
    
    private String submissionText;
    private String attachmentUrl;
    private LocalDateTime submittedAt;
    private Double score;
    private String feedback;
    private String status; // SUBMITTED, GRADED, LATE
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
