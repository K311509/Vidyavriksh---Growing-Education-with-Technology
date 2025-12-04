package com.vidyavriksh.dto;

import com.vidyavriksh.model.Alert;
import com.vidyavriksh.model.Attendance;
import com.vidyavriksh.model.Grade;
import com.vidyavriksh.model.Student;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class StudentDashboardData {
    private Student student;
    private List<Grade> recentGrades;
    private List<Attendance> recentAttendance;
    private List<Alert> activeAlerts;
    private Integer upcomingAssignments;
    private Integer pendingSubmissions;
}