package com.vidyavriksh.service;

import com.vidyavriksh.dto.AuthResponse;
import com.vidyavriksh.dto.LoginRequest;
import com.vidyavriksh.dto.RegisterRequest;
import com.vidyavriksh.model.Role;
import com.vidyavriksh.model.Student;
import com.vidyavriksh.model.Teacher;
import com.vidyavriksh.model.User;
import com.vidyavriksh.repository.StudentRepository;
import com.vidyavriksh.repository.TeacherRepository;
import com.vidyavriksh.repository.UserRepository;
import com.vidyavriksh.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository    userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder   passwordEncoder;
    private final JwtTokenProvider  jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Email already registered: " + req.getEmail());
        }

        Role role = mapRole(req.getRole());

        User user = new User();
        user.setEmail(req.getEmail());
        user.setUsername(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getName());
        user.setPhone(req.getPhone());
        user.setRoles(Set.of(role));
        user = userRepository.save(user);

        String profileId = null;

        if (role == Role.ROLE_TEACHER) {
            Teacher teacher = new Teacher();
            teacher.setUserId(user.getId());
            teacher.setSubject(req.getSubject());
            teacher.setAssignedClass(req.getAssignedClass());
            teacher.setAssignedSection(req.getSection());
            teacher.setDepartment(req.getSubject());
            profileId = teacherRepository.save(teacher).getId();
        } else if (role == Role.ROLE_STUDENT) {
            Student student = new Student();
            student.setUserId(user.getId());
            student.setClassGrade(req.getClassGrade());
            student.setSection(req.getStudentSection());
            profileId = studentRepository.save(student).getId();
        }

        String roleStr = role.name().replace("ROLE_", "");
        String token = jwtUtil.generateToken(user.getEmail(), roleStr, user.getId());
        return new AuthResponse(token, user.getId(), roleStr, user.getFullName(), profileId);
    }

    public AuthResponse login(LoginRequest req) {
        // Find user
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "User not found: " + req.getEmail()));

        if (!user.isActive())
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Account is deactivated. Contact admin.");

        // ✅ Debug log — check what's in DB vs what's being matched
        log.debug("Login attempt for: {}", req.getEmail());
        log.debug("Stored hash: {}", user.getPassword());
        log.debug("Roles: {}", user.getRoles());

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid password");

        // ✅ Guard against empty roles (old schema users)
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Account not migrated. Contact admin.");
        }

        String profileId = null;
        Role role = user.getRoles().stream().findFirst().orElse(Role.ROLE_STUDENT);

        if (role == Role.ROLE_TEACHER) {
            profileId = teacherRepository.findByUserId(user.getId())
                    .map(Teacher::getId).orElse(null);
        } else if (role == Role.ROLE_STUDENT) {
            profileId = studentRepository.findByUserId(user.getId())
                    .map(Student::getId).orElse(null);
        }

        String roleStr = role.name().replace("ROLE_", "");
        String token = jwtUtil.generateToken(user.getEmail(), roleStr, user.getId());
        return new AuthResponse(token, user.getId(), roleStr, user.getFullName(), profileId);
    }

    private Role mapRole(String roleStr) {
        if (roleStr == null) return Role.ROLE_STUDENT;
        return switch (roleStr.toUpperCase()) {
            case "TEACHER" -> Role.ROLE_TEACHER;
            case "ADMIN"   -> Role.ROLE_ADMIN;
            case "PARENT"  -> Role.ROLE_PARENT;
            default        -> Role.ROLE_STUDENT;
        };
    }
}