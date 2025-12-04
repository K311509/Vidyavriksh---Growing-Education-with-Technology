package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "attendance")
public class Attendance {
    @Id
    private String id;
    
    @DBRef
    private Student student;
    
    private LocalDate date;
    private String status; // PRESENT, ABSENT, LATE, EXCUSED
    private String remarks;
    private String subject;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}