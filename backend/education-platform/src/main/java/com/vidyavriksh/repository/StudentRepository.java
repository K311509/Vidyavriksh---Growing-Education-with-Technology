package com.vidyavriksh.repository;

import com.vidyavriksh.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByUserId(String userId);
    List<Student> findByClassGrade(String classGrade);
    List<Student> findByClassGradeAndSection(String classGrade, String section);
    
    @Query("{'dropoutRiskScore': {$gte: ?0}}")
    List<Student> findHighRiskStudents(Double threshold);
    
    @Query("{'attendancePercentage': {$lt: ?0}}")
    List<Student> findStudentsWithLowAttendance(Double threshold);
    
    List<Student> findByRiskLevel(String riskLevel);
}