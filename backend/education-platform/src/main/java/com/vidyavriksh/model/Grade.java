package com.vidyavriksh.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
@Document(collection = "grades")
public class Grade {
    @Id private String id;
    private String studentId;
    private String teacherId;
    private String classGrade;
    private String section;
    private String subject;
    private String examType;     // Unit Test, Mid Term, Final Exam, Quiz
    private LocalDate examDate;
    private double score;
    private double maxScore;
    private double percentage;
    private String grade;        // A+, A, B, etc. — computed
    private LocalDateTime createdAt = LocalDateTime.now();

    public void computeGradeLetter() {
        this.percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        if      (percentage >= 90) this.grade = "A+";
        else if (percentage >= 80) this.grade = "A";
        else if (percentage >= 70) this.grade = "B";
        else if (percentage >= 60) this.grade = "C";
        else if (percentage >= 50) this.grade = "D";
        else                        this.grade = "F";
    }
}