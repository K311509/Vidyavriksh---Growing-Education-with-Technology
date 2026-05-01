package com.vidyavriksh.service;

import com.vidyavriksh.dto.GradeRequest;
import com.vidyavriksh.dto.GradeResponse;
import com.vidyavriksh.model.Grade;
import com.vidyavriksh.model.Student;
import com.vidyavriksh.model.User;
import com.vidyavriksh.repository.GradeRepository;
import com.vidyavriksh.repository.UserRepository;
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
    private final StudentService  studentService;
    private final UserRepository  userRepository;

    @Transactional
    public GradeResponse addGrade(GradeRequest request) {
        Student student = studentService.getStudentById(request.getStudentId());

        Grade grade = new Grade();
        // Grade model uses plain String studentId — NOT @DBRef Student
        grade.setStudentId(student.getId());
        grade.setSubject(request.getSubject());
        grade.setExamType(request.getExamType());
        grade.setScore(request.getScore());
        grade.setMaxScore(request.getMaxScore());

        double percentage = request.getMaxScore() > 0
             ? (request.getScore() / request.getMaxScore()) * 100
                                       : 0;
        grade.setPercentage(percentage);
        grade.setGrade(calculateGrade(percentage));
        grade.setExamDate(request.getExamDate());

        grade = gradeRepository.save(grade);

        log.info("Grade added for student: {} in {}", student.getId(), request.getSubject());

        // Update student GPA
        studentService.updateGPA(request.getStudentId());

        // Award gamification points for good grades
        if (percentage >= 90) {
            studentService.addGamificationPoints(request.getStudentId(), 50);
        } else if (percentage >= 80) {
            studentService.addGamificationPoints(request.getStudentId(), 30);
        }

        return mapToResponse(grade);
    }

    public List<GradeResponse> getStudentGrades(String studentId) {
        return gradeRepository.findByStudentIdOrderByExamDateDesc(studentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<GradeResponse> getGradesBySubject(String studentId, String subject) {
        return gradeRepository.findByStudentIdAndSubject(studentId, subject)
                .stream()
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
        // Grade uses studentId String, not @DBRef — fetch student separately
        Student student = studentService.getStudentById(grade.getStudentId());

        User user = null;
        if (student.getUserId() != null) {
            user = userRepository.findById(student.getUserId()).orElse(null);
        }

        GradeResponse response = new GradeResponse();
        response.setId(grade.getId());
        response.setStudentId(grade.getStudentId());
        response.setStudentName(user != null ? user.getFullName() : "Unknown");
        response.setSubject(grade.getSubject());
        response.setExamType(grade.getExamType());
        response.setScore(grade.getScore());
        response.setMaxScore(grade.getMaxScore());
        response.setPercentage(grade.getPercentage());
        response.setGrade(grade.getGrade());
        response.setExamDate(grade.getExamDate());
        return response;
    }
}