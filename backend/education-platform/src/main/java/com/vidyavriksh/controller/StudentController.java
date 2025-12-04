package com.vidyavriksh.controller;

import com.vidyavriksh.dto.*;
import com.vidyavriksh.model.Student;
import com.vidyavriksh.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Student>> getStudent(@PathVariable String id) {
        Student student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved successfully", student));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Student>> getStudentByUserId(@PathVariable String userId) {
        Student student = studentService.getStudentByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved", student));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Student>>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", students));
    }

    @GetMapping("/class/{classGrade}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Student>>> getStudentsByClass(
            @PathVariable String classGrade,
            @RequestParam(required = false) String section) {
        List<Student> students = studentService.getStudentsByClass(classGrade, section);
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", students));
    }

    @GetMapping("/high-risk")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Student>>> getHighRiskStudents() {
        List<Student> students = studentService.getHighRiskStudents();
        return ResponseEntity.ok(ApiResponse.success("High-risk students retrieved", students));
    }

    @GetMapping("/low-attendance")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Student>>> getStudentsWithLowAttendance(
            @RequestParam(defaultValue = "75.0") Double threshold) {
        List<Student> students = studentService.getStudentsWithLowAttendance(threshold);
        return ResponseEntity.ok(ApiResponse.success("Students with low attendance retrieved", students));
    }

    @GetMapping("/{id}/dashboard")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentDashboardData>> getDashboard(@PathVariable String id) {
        StudentDashboardData data = studentService.getDashboardData(id);
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Student>> updateStudent(
            @PathVariable String id,
            @RequestBody StudentUpdateRequest request) {
        Student student = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", student));
    }

    @PostMapping("/{id}/points")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<String>> addPoints(
            @PathVariable String id,
            @RequestParam int points) {
        studentService.addGamificationPoints(id, points);
        return ResponseEntity.ok(ApiResponse.success("Points added successfully", null));
    }

    @PostMapping("/{id}/badge")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<String>> addBadge(
            @PathVariable String id,
            @RequestParam String badge) {
        studentService.addBadge(id, badge);
        return ResponseEntity.ok(ApiResponse.success("Badge added successfully", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }
}