package com.vidyavriksh.config;

import com.vidyavriksh.model.Role;
import com.vidyavriksh.model.User;
import com.vidyavriksh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Only create if admin doesn't exist
        if (userRepository.existsByUsername("admin")) return;

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@vidyavriksh.com");
        admin.setFullName("System Admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRoles(Set.of(Role.ROLE_ADMIN));
        userRepository.save(admin);

        System.out.println("✅ ADMIN CREATED: email=admin@vidyavriksh.com | password=admin123");
    }
}