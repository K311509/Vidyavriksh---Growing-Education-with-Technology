package com.vidyavriksh.service;

import com.vidyavriksh.dto.GradeRequest;
import com.vidyavriksh.dto.GradeResponse;
import com.vidyavriksh.model.Grade;
import com.vidyavriksh.model.Student;
import com.vidyavriksh.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final StudentService studentService;

    @Transactional
    public GradeResponse addGrade(GradeRequest request) {
        Student student = studentService.getStudentById(request.getStudentId());
        
        Grade grade = new Grade();
        grade.setStudent(student);
        grade.setSubject(request.getSubject());
        grade.setExamType(request.getExamType());
        grade.setScore(request.getScore());
        grade.setMaxScore(request.getMaxScore());
        
        // Calculate percentage and grade
        double percentage = (request.getScore() / request.getMaxScore()) * 100;
        grade.setPercentage(percentage);
        grade.setGrade(calculateGrade(percentage));
        
        grade.setSemester(request.getSemester());
        grade.setAcademicYear(request.getAcademicYear());
        grade.setExamDate(request.getExamDate());
        
        grade = gradeRepository.save(grade);
        log.info("Grade added for student: {} in {}", student.getStudentId(), request.getSubject());
        
        // Update student GPA
        studentService.updateGPA(request.getStudentId());
        
        // Award points for good grades
        if (percentage >= 90) {
            studentService.addGamificationPoints(request.getStudentId(), 50);
        } else if (percentage >= 80) {
            studentService.addGamificationPoints(request.getStudentId(), 30);
        }
        
        return mapToResponse(grade);
    }

    public List<GradeResponse> getStudentGrades(String studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        return grades.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<GradeResponse> getGradesBySubject(String studentId, String subject) {
        List<Grade> grades = gradeRepository.findByStudentIdAndSubject(studentId, subject);
        return grades.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private String calculateGrade(double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B+";
        if (percentage >= 60) return "B";
        if (percentage >= 50) return "C";
        if (percentage >= 40) return "D";
        return "F";
    }

    private GradeResponse mapToResponse(Grade grade) {
        GradeResponse response = new GradeResponse();
        response.setId(grade.getId());
        response.setStudentId(grade.getStudent().getId());
        response.setStudentName(grade.getStudent().getUser().getFullName());
        response.setSubject(grade.getSubject());
        response.setExamType(grade.getExamType());
        response.setScore(grade.getScore());
        response.setMaxScore(grade.getMaxScore());
        response.setPercentage(grade.getPercentage());
        response.setGrade(grade.getGrade());
        response.setSemester(grade.getSemester());
        response.setAcademicYear(grade.getAcademicYear());
        response.setExamDate(grade.getExamDate());
        return response;
    }
}