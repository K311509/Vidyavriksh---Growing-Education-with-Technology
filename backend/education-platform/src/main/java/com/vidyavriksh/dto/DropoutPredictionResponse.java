package com.vidyavriksh.dto;

import lombok.Data;
import java.util.List;

@Data
public class DropoutPredictionResponse {
    private String studentId;
    private Double riskScore;
    private String riskLevel;
    private List<String> riskFactors;
    private List<String> recommendations;
}