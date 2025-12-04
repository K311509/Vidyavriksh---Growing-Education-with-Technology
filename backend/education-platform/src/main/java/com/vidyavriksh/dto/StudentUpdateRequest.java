package com.vidyavriksh.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class StudentUpdateRequest {
    private String classGrade;
    private String section;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String guardianName;
    private String guardianPhone;
    private String guardianEmail;
}