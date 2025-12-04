package com.vidyavriksh.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class StudentResponse {
    private String id;
    private String studentId;
    private String fullName;
    private String email;
    private String classGrade;
    private String section;
    private LocalDate dateOfBirth;
    private String gender;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
    
    // Academic Info
    private Double currentGPA;
    private Double attendancePercentage;
    private Integer totalPresent;
    private Integer totalAbsent;
    
    // Risk Assessment
    private Double dropoutRiskScore;
    private String riskLevel;
    private List<String> riskFactors;
    
    // Gamification
    private Integer gamificationPoints;
    private List<String> badges;
    private Integer streakDays;
    
    private LocalDateTime createdAt;
}