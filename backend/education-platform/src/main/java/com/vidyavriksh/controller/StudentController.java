package com.vidyavriksh.controller;

import com.vidyavriksh.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    /** GET /api/student/{studentId} — student profile */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getStudent(@PathVariable String studentId) {
        try { return ResponseEntity.ok(studentService.getStudentById(studentId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** GET /api/student/user/{userId} — get profile by userId (for login redirect) */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getStudentByUserId(@PathVariable String userId) {
        try { return ResponseEntity.ok(Map.of("data", studentService.getStudentByUserId(userId))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** GET /api/student/{studentId}/dashboard — full dashboard data */
    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable String studentId) {
        try { return ResponseEntity.ok(studentService.getDashboard(studentId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** GET /api/student/{studentId}/risk — dropout risk prediction */
    @GetMapping("/{studentId}/risk")
    public ResponseEntity<?> getRisk(@PathVariable String studentId) {
        try { return ResponseEntity.ok(studentService.getRiskPrediction(studentId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** GET /api/student/{studentId}/grades */
    @GetMapping("/{studentId}/grades")
    public ResponseEntity<?> getGrades(@PathVariable String studentId) {
        try { return ResponseEntity.ok(studentService.getGrades(studentId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** GET /api/student/{studentId}/attendance */
    @GetMapping("/{studentId}/attendance")
    public ResponseEntity<?> getAttendance(@PathVariable String studentId) {
        try { return ResponseEntity.ok(studentService.getAttendance(studentId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** GET /api/student/{studentId}/assignments */
    @GetMapping("/{studentId}/assignments")
    public ResponseEntity<?> getAssignments(@PathVariable String studentId) {
        try { return ResponseEntity.ok(studentService.getAssignments(studentId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    /** GET /api/student — get all students (for admin/teacher/parent) */
    @GetMapping
    public ResponseEntity<?> getAllStudents() {
        try { 
            return ResponseEntity.ok(Map.of("data", studentService.getAllStudents())); 
           }
        catch (Exception e) { 
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); 
        }
    }
}