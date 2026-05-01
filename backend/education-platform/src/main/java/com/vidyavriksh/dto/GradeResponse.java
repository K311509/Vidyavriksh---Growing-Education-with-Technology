package com.vidyavriksh.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class GradeResponse {
    private String id;
    private String studentId;
    private String studentName;
    private String subject;
    private String examType;
    private Double score;
    private Double maxScore;
    private Double percentage;
    private String grade;
    private String semester;
    private String academicYear;
    private LocalDate examDate;
}