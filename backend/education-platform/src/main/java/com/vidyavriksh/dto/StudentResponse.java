package com.vidyavriksh.dto;

import com.vidyavriksh.model.Student;
import lombok.Data;
import java.util.List;

@Data
public class StudentResponse {
    private String id;
    private String userId;
    private String studentId;
    private String classGrade;
    private String section;
    private Double gpa;
    private Double attendance;
    private int engagement;
    private int riskScore;
    private String riskLevel;
    private List<String> badges;
    private int gamificationPoints;
    private String name;    // populated from User
    private String email;   // populated from User
    private int rollNo;
    private String avatar;

    public static StudentResponse from(Student s) {
        StudentResponse r = new StudentResponse();
        r.id                 = s.getId();
        r.userId             = s.getUserId();
        r.studentId          = s.getStudentId();
        r.classGrade         = s.getClassGrade();
        r.section            = s.getSection();
        r.gpa                = s.getCurrentGPA() != null ? s.getCurrentGPA() : 0.0;
        r.attendance         = s.getAttendancePercentage() != null ? s.getAttendancePercentage() : 0.0;
        r.engagement         = s.getGamificationPoints() != null ? s.getGamificationPoints() : 0;
        r.riskScore          = s.getDropoutRiskScore() != null ? s.getDropoutRiskScore().intValue() : 0;
        r.riskLevel          = s.getRiskLevel() != null ? s.getRiskLevel() : "LOW";
        r.badges             = s.getBadges();
        r.gamificationPoints = s.getGamificationPoints() != null ? s.getGamificationPoints() : 0;
        
        return r;
    }
}