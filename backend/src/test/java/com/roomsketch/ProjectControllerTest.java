package com.roomsketch;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomsketch.controller.ProjectController;
import com.roomsketch.dto.CreateProjectRequest;
import com.roomsketch.dto.ProjectDetailResponse;
import com.roomsketch.dto.ProjectResponse;
import com.roomsketch.dto.UpdateProjectRequest;
import com.roomsketch.security.JwtUtils;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.security.UserDetailsServiceImpl;
import com.roomsketch.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectService projectService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    private UUID userId;
    private UUID projectId;
    private ProjectResponse projectResponse;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        projectId = UUID.randomUUID();

        UserDetailsImpl userPrincipal = new UserDetailsImpl(
                userId,
                "architect@roomsketch.com",
                "Jane",
                "Doe",
                "password",
                Collections.emptyList()
        );

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        projectResponse = ProjectResponse.builder()
                .id(projectId)
                .name("The garden apartment")
                .description("85.3 m² test project")
                .unitSystem("METERS")
                .floorCount(1)
                .roomCount(5)
                .totalArea(85.3)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void shouldListProjects() throws Exception {
        when(projectService.getAllProjects(eq(userId), any(), any()))
                .thenReturn(List.of(projectResponse));

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("The garden apartment"));
    }

    @Test
    void shouldCreateProject() throws Exception {
        CreateProjectRequest request = CreateProjectRequest.builder()
                .name("New Apartment")
                .unitSystem("METERS")
                .templateId("blank")
                .build();

        when(projectService.createProject(eq(userId), any(CreateProjectRequest.class)))
                .thenReturn(projectResponse);

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("The garden apartment"));
    }

    @Test
    void shouldGetProjectById() throws Exception {
        ProjectDetailResponse detailResponse = ProjectDetailResponse.builder()
                .id(projectId)
                .name("The garden apartment")
                .unitSystem("METERS")
                .floors(Collections.emptyList())
                .build();

        when(projectService.getProjectById(projectId, userId)).thenReturn(detailResponse);

        mockMvc.perform(get("/api/projects/" + projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(projectId.toString()));
    }

    @Test
    void shouldUpdateProject() throws Exception {
        UpdateProjectRequest updateRequest = UpdateProjectRequest.builder()
                .name("Renamed Apartment")
                .unitSystem("FEET")
                .build();

        when(projectService.updateProject(eq(projectId), eq(userId), any(UpdateProjectRequest.class)))
                .thenReturn(projectResponse);

        mockMvc.perform(put("/api/projects/" + projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void shouldDeleteProject() throws Exception {
        mockMvc.perform(delete("/api/projects/" + projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void shouldDuplicateProject() throws Exception {
        when(projectService.duplicateProject(projectId, userId)).thenReturn(projectResponse);

        mockMvc.perform(post("/api/projects/" + projectId + "/duplicate"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }
}
