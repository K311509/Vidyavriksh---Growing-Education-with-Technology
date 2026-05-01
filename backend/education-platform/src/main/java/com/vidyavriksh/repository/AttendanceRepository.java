package com.vidyavriksh.repository;

import com.vidyavriksh.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    // Attendance model has @DBRef Student — query by student id via DBRef
    @Query("{ 'student.$id': ?0 }")
    List<Attendance> findByStudentId(String studentId);

    @Query("{ 'student.$id': ?0, 'date': { '$gte': ?1, '$lte': ?2 } }")
    List<Attendance> findByStudentIdAndDateBetween(String studentId, LocalDate start, LocalDate end);

    List<Attendance> findByDate(LocalDate date);

    // Attendance model has NO classGrade/section/teacherId fields — removed those methods
}