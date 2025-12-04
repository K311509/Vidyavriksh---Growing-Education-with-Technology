package com.vidyavriksh.service;

import com.vidyavriksh.dto.*;
import com.vidyavriksh.exception.BadRequestException;
import com.vidyavriksh.model.*;
import com.vidyavriksh.repository.*;
import com.vidyavriksh.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());
        
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Set roles
        Set<Role> roles = new HashSet<>();
        roles.add(Role.valueOf("ROLE_" + request.getRole().toUpperCase()));
        user.setRoles(roles);
        
        user = userRepository.save(user);
        log.info("User created with ID: {}", user.getId());

        // Create profile based on role
        if (request.getRole().equalsIgnoreCase("STUDENT")) {
            createStudentProfile(user, request);
        } else if (request.getRole().equalsIgnoreCase("TEACHER")) {
            createTeacherProfile(user, request);
        }

        // Authenticate and generate token
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getUsername());
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        log.info("User logged in successfully: {}", user.getUsername());

        return AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles())
                .build();
    }

    private void createStudentProfile(User user, RegisterRequest request) {
        Student student = new Student();
        student.setUser(user);
        student.setStudentId(generateStudentId());
        student.setClassGrade(request.getClassGrade());
        student.setSection(request.getSection());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianPhone(request.getGuardianPhone());
        student.setGuardianEmail(request.getGuardianEmail());
        
        studentRepository.save(student);
        log.info("Student profile created: {}", student.getStudentId());
    }

    private void createTeacherProfile(User user, RegisterRequest request) {
        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setTeacherId(generateTeacherId());
        teacher.setDepartment(request.getDepartment());
        teacher.setSubject(request.getSubject());
        teacher.setYearsOfExperience(request.getYearsOfExperience());
        
        teacherRepository.save(teacher);
        log.info("Teacher profile created: {}", teacher.getTeacherId());
    }

    private String generateStudentId() {
        return "STU" + System.currentTimeMillis();
    }

    private String generateTeacherId() {
        return "TCH" + System.currentTimeMillis();
    }
}