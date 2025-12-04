package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Data
@Document(collection = "alerts")
public class Alert {
    @Id
    private String id;
    
    @DBRef
    private Student student;
    
    private String alertType; // DROPOUT_RISK, LOW_ATTENDANCE, POOR_GRADES, BEHAVIORAL
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String message;
    private String description;
    private boolean acknowledged = false;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}