package com.vidyavriksh.controller;

import com.vidyavriksh.dto.ApiResponse;
import com.vidyavriksh.dto.GradeRequest;
import com.vidyavriksh.dto.GradeResponse;
import com.vidyavriksh.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<GradeResponse>> addGrade(
            @Valid @RequestBody GradeRequest request) {
        GradeResponse response = gradeService.addGrade(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Grade added successfully", response));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<GradeResponse>>> getStudentGrades(
            @PathVariable String studentId) {
        List<GradeResponse> grades = gradeService.getStudentGrades(studentId);
        return ResponseEntity.ok(ApiResponse.success("Grades retrieved successfully", grades));
    }

    @GetMapping("/student/{studentId}/subject/{subject}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<GradeResponse>>> getGradesBySubject(
            @PathVariable String studentId,
            @PathVariable String subject) {
        List<GradeResponse> grades = gradeService.getGradesBySubject(studentId, subject);
        return ResponseEntity.ok(ApiResponse.success("Grades retrieved successfully", grades));
    }
}