package com.vidyavriksh.repository;

import com.vidyavriksh.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    List<Attendance> findByStudentId(String studentId);
    List<Attendance> findByStudentIdAndDateBetween(
        String studentId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByStudentIdAndStatus(String studentId, String status);
}