package com.roomsketch.config;

import com.roomsketch.dto.CreateFloorRequest;
import com.roomsketch.dto.CreateProjectRequest;
import com.roomsketch.dto.ProjectResponse;
import com.roomsketch.entity.User;
import com.roomsketch.repository.ProjectRepository;
import com.roomsketch.repository.UserRepository;
import com.roomsketch.service.FloorService;
import com.roomsketch.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectService projectService;
    private final FloorService floorService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String demoEmail = "demo@roomsketch.com";
        User demoUser = userRepository.findByEmail(demoEmail).orElse(null);

        if (demoUser == null) {
            demoUser = User.builder()
                    .email(demoEmail)
                    .passwordHash(passwordEncoder.encode("password123"))
                    .firstName("Demo")
                    .lastName("Architect")
                    .role("ROLE_USER")
                    .build();
            demoUser = userRepository.save(demoUser);
            logger.info("Created default demo user: {}", demoEmail);
        }

        if (projectRepository.countByUserId(demoUser.getId()) == 0) {
            logger.info("Seeding realistic sample projects for demo user...");

            // Project 1: The garden apartment (Reference design matching uploaded image: 85.3 m²)
            CreateProjectRequest p1 = CreateProjectRequest.builder()
                    .name("The garden apartment")
                    .description("Personal workspace / Floor plan - 85.3 m² with 5 rooms and outdoor terrace access")
                    .unitSystem("METERS")
                    .templateId("garden-apartment")
                    .build();
            projectService.createProject(demoUser.getId(), p1);

            // Project 2: Scandinavian Studio
            CreateProjectRequest p2 = CreateProjectRequest.builder()
                    .name("Scandinavian Studio")
                    .description("Compact 42 m² open-concept urban studio with ensuite bathroom")
                    .unitSystem("METERS")
                    .templateId("modern-studio")
                    .build();
            projectService.createProject(demoUser.getId(), p2);

            // Project 3: Two-Story Contemporary Villa (Multi-level architectural project)
            CreateProjectRequest p3 = CreateProjectRequest.builder()
                    .name("Two-Story Contemporary Villa")
                    .description("Spacious 145 m² two-level residence with living/dining on Ground Floor and bedrooms on Second Floor")
                    .unitSystem("METERS")
                    .templateId("garden-apartment")
                    .build();
            ProjectResponse villa = projectService.createProject(demoUser.getId(), p3);

            // Add Second Floor to Villa (demonstrating Phase 6 multi-floor switching)
            CreateFloorRequest secondFloor = CreateFloorRequest.builder()
                    .name("Second floor")
                    .floorNumber(2)
                    .build();
            floorService.addFloor(villa.getId(), demoUser.getId(), secondFloor);

            logger.info("Sample projects seeded successfully!");
        }
    }
}
