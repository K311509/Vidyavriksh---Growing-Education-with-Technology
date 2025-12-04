package com.vidyavriksh.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DropoutPredictionRequest {
    private String studentId;
    private Double attendancePercentage;
    private Double gpa;
    private Integer absences;
    private Double participationScore;
    private Integer behavioralIssues;
}