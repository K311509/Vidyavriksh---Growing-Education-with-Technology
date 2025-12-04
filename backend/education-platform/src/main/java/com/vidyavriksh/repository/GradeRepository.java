package com.vidyavriksh.repository;

import com.vidyavriksh.model.Grade;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GradeRepository extends MongoRepository<Grade, String> {
    List<Grade> findByStudentId(String studentId);
    List<Grade> findByStudentIdAndSemester(String studentId, String semester);
    List<Grade> findByStudentIdAndSubject(String studentId, String subject);
    List<Grade> findBySubjectAndAcademicYear(String subject, String academicYear);
}