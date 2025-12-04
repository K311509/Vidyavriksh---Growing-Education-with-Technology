package com.vidyavriksh.service;

import com.vidyavriksh.dto.AttendanceRequest;
import com.vidyavriksh.dto.AttendanceResponse;
import com.vidyavriksh.exception.BadRequestException;
import com.vidyavriksh.model.Attendance;
import com.vidyavriksh.model.Student;
import com.vidyavriksh.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentService studentService;

    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request) {
        Student student = studentService.getStudentById(request.getStudentId());
        
        // Check if attendance already exists for this date
        List<Attendance> existing = attendanceRepository
                .findByStudentIdAndDateBetween(
                    request.getStudentId(), 
                    request.getDate(), 
                    request.getDate()
                );
        
        if (!existing.isEmpty()) {
            throw new BadRequestException("Attendance already marked for this date");
        }
        
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setDate(request.getDate());
        attendance.setStatus(request.getStatus());
        attendance.setRemarks(request.getRemarks());
        attendance.setSubject(request.getSubject());
        
        attendance = attendanceRepository.save(attendance);
        log.info("Attendance marked for student: {} on {}", student.getStudentId(), request.getDate());
        
        // Update student attendance percentage
        studentService.updateAttendancePercentage(request.getStudentId());
        
        return mapToResponse(attendance);
    }

    public List<AttendanceResponse> getStudentAttendance(String studentId) {
        List<Attendance> attendanceList = attendanceRepository.findByStudentId(studentId);
        return attendanceList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByDateRange(
            String studentId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendanceList = attendanceRepository
                .findByStudentIdAndDateBetween(studentId, startDate, endDate);
        return attendanceList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        List<Attendance> attendanceList = attendanceRepository.findByDate(date);
        return attendanceList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        response.setStudentId(attendance.getStudent().getId());
        response.setStudentName(attendance.getStudent().getUser().getFullName());
        response.setDate(attendance.getDate());
        response.setStatus(attendance.getStatus());
        response.setRemarks(attendance.getRemarks());
        response.setSubject(attendance.getSubject());
        return response;
    }
}