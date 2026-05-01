package com.vidyavriksh.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    private String role;       // "TEACHER", "STUDENT", "PARENT", "ADMIN"
    private String phone;
    // Teacher fields
    private String subject;
    private String assignedClass;
    private String section;
    // Student fields
    private String classGrade;
    private String studentSection;
    private Integer rollNo;
    private String parentId;
}