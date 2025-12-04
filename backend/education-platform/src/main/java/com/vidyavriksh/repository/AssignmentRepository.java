package com.vidyavriksh.repository;

import com.vidyavriksh.model.Assignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findByTeacherId(String teacherId);
    List<Assignment> findBySubject(String subject);
    List<Assignment> findByClassGrade(String classGrade);
    List<Assignment> findByDueDateBetween(LocalDateTime start, LocalDateTime end);
    List<Assignment> findByClassGradeAndSubject(String classGrade, String subject);
}