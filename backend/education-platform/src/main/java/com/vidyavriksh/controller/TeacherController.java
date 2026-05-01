package com.vidyavriksh.controller;

import com.vidyavriksh.dto.*;
import com.vidyavriksh.model.*;
import com.vidyavriksh.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    // Profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String userId) {
        try { return ResponseEntity.ok(teacherService.getTeacherByUserId(userId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/{teacherId}")
    public ResponseEntity<?> getTeacher(@PathVariable String teacherId) {
        try { return ResponseEntity.ok(teacherService.getTeacherById(teacherId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // Students
    @GetMapping("/{teacherId}/students")
    public ResponseEntity<?> getStudents(@PathVariable String teacherId) {
        try { return ResponseEntity.ok(teacherService.getMyStudents(teacherId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // Attendance - bulk mark
    @PostMapping("/{teacherId}/attendance")
    public ResponseEntity<?> markAttendance(@PathVariable String teacherId,
                                            @RequestBody AttendanceRequest req) {
        try { return ResponseEntity.ok(teacherService.markBulkAttendance(teacherId, req)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/{teacherId}/attendance/history")
    public ResponseEntity<?> getAttendanceHistory(@PathVariable String teacherId) {
        try { return ResponseEntity.ok(teacherService.getAttendanceHistory(teacherId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // Assignments
    @GetMapping("/{teacherId}/assignments")
    public ResponseEntity<?> getAssignments(@PathVariable String teacherId) {
        try { return ResponseEntity.ok(teacherService.getMyAssignments(teacherId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/{teacherId}/assignments")
    public ResponseEntity<?> createAssignment(@PathVariable String teacherId,
                                              @Valid @RequestBody AssignmentRequest req) {
        try { return ResponseEntity.ok(teacherService.createAssignment(teacherId, req)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @DeleteMapping("/{teacherId}/assignments/{assignmentId}")
    public ResponseEntity<?> deleteAssignment(@PathVariable String teacherId,
                                              @PathVariable String assignmentId) {
        try { teacherService.deleteAssignment(assignmentId, teacherId);
              return ResponseEntity.ok(Map.of("message", "Deleted")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // Engagement
    @PostMapping("/{teacherId}/engagement")
    public ResponseEntity<?> updateEngagement(@PathVariable String teacherId,
                                              @Valid @RequestBody EngagementRequest req) {
        try { return ResponseEntity.ok(teacherService.updateEngagement(teacherId, req)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/{teacherId}/engagement/badge")
    public ResponseEntity<?> awardBadge(@PathVariable String teacherId,
                                        @Valid @RequestBody BadgeRequest req) {
        try { return ResponseEntity.ok(teacherService.awardBadge(teacherId, req)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @DeleteMapping("/{teacherId}/engagement/badge")
    public ResponseEntity<?> removeBadge(@PathVariable String teacherId,
                                         @RequestBody BadgeRequest req) {
        try { return ResponseEntity.ok(teacherService.removeBadge(teacherId, req)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // Alerts
    @GetMapping("/{teacherId}/alerts")
    public ResponseEntity<?> getAlerts(@PathVariable String teacherId) {
        try { return ResponseEntity.ok(teacherService.getAlerts(teacherId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // Risk
    @GetMapping("/{teacherId}/risk")
    public ResponseEntity<?> getRisk(@PathVariable String teacherId,
                                     @RequestParam(defaultValue = "ALL") String level) {
        try { return ResponseEntity.ok(teacherService.getStudentsByRisk(teacherId, level)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}