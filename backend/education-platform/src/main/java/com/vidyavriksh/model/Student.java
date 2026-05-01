package com.vidyavriksh.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "students")
public class Student {
    @Id
    private String id;
    
    private String userId;
    
    private String studentId;
    private String classGrade;
    private String section;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    
    // Academic Information
    private Double currentGPA;
    private Integer totalCredits;
    private String admissionYear;
    
    // Dropout Risk Assessment
    private Double dropoutRiskScore = 0.0;
    private String riskLevel = "LOW"; // LOW, MEDIUM, HIGH
    private List<String> riskFactors = new ArrayList<>();
    
    // Attendance
    private Double attendancePercentage = 100.0;
    private Integer totalPresent = 0;
    private Integer totalAbsent = 0;
    
    // Engagement Metrics
    private Integer gamificationPoints = 0;
    private List<String> badges = new ArrayList<>();
    private Integer streakDays = 0;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}