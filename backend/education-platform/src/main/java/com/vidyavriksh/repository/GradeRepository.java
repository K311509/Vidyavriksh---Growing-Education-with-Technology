package com.vidyavriksh.repository;

import com.vidyavriksh.model.Grade;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GradeRepository extends MongoRepository<Grade, String> {
    List<Grade> findByStudentIdOrderByExamDateDesc(String studentId);
    List<Grade> findByStudentIdAndSubject(String studentId, String subject);
    List<Grade> findByTeacherIdOrderByCreatedAtDesc(String teacherId);
    List<Grade> findByClassGradeAndSection(String classGrade, String section);
}