package com.vidyavriksh.repository;

import com.vidyavriksh.model.Assignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {

    @Query("{ 'teacherId': ?0 }")  // ✅ plain string field
    List<Assignment> findByTeacherId(String teacherId);

    @Query("{ 'teacherId': ?0 }")  // ✅ same fix
    List<Assignment> findByTeacherIdOrderByCreatedAtDesc(String teacherId);

    List<Assignment> findByClassGrade(String classGrade);

    @Query("{ 'classGrade': ?0 }")
    List<Assignment> findByClassGradeAndSection(String classGrade, String section);
}