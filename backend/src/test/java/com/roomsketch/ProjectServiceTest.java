package com.roomsketch;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomsketch.dto.CreateProjectRequest;
import com.roomsketch.dto.DashboardStatsResponse;
import com.roomsketch.dto.ProjectDetailResponse;
import com.roomsketch.dto.ProjectResponse;
import com.roomsketch.dto.UpdateProjectRequest;
import com.roomsketch.entity.Floor;
import com.roomsketch.entity.Project;
import com.roomsketch.entity.User;
import com.roomsketch.exception.ResourceNotFoundException;
import com.roomsketch.repository.FloorRepository;
import com.roomsketch.repository.ProjectRepository;
import com.roomsketch.repository.UserRepository;
import com.roomsketch.service.ProjectService;
import com.roomsketch.service.TemplateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private FloorRepository floorRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TemplateService templateService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ProjectService projectService;

    private User user;
    private Project project;
    private UUID userId;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        projectId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .email("test@roomsketch.com")
                .firstName("Test")
                .lastName("Architect")
                .build();

        project = Project.builder()
                .id(projectId)
                .user(user)
                .name("The garden apartment")
                .description("85.3 m² test project")
                .unitSystem("METERS")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void shouldCreateProjectWithInitialFloor() {
        CreateProjectRequest request = CreateProjectRequest.builder()
                .name("The garden apartment")
                .description("Luxury space")
                .unitSystem("METERS")
                .templateId("garden-apartment")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(templateService.getTemplateLayout("garden-apartment")).thenReturn("{}");
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId)).thenReturn(Collections.emptyList());

        ProjectResponse response = projectService.createProject(userId, request);

        assertNotNull(response);
        assertEquals("The garden apartment", response.getName());
        verify(floorRepository).save(any(Floor.class));
    }

    @Test
    void shouldGetAllProjectsForUserWithSearch() {
        when(projectRepository.findByUserId(eq(userId), any(Sort.class)))
                .thenReturn(List.of(project));
        when(floorRepository.findByProjectIdInOrderByFloorNumberAsc(anyList()))
                .thenReturn(Collections.emptyList());

        List<ProjectResponse> all = projectService.getAllProjects(userId, "updatedAt_desc", "garden");
        assertEquals(1, all.size());
        assertEquals("The garden apartment", all.get(0).getName());

        List<ProjectResponse> none = projectService.getAllProjects(userId, "updatedAt_desc", "nonexistent");
        assertEquals(0, none.size());
    }

    @Test
    void shouldGetDashboardStats() {
        when(projectRepository.findByUserId(eq(userId), any(Sort.class)))
                .thenReturn(List.of(project));
        when(floorRepository.findByProjectIdInOrderByFloorNumberAsc(anyList()))
                .thenReturn(Collections.emptyList());

        DashboardStatsResponse stats = projectService.getDashboardStats(userId);
        assertNotNull(stats);
        assertEquals(1, stats.getTotalProjects());
        assertEquals(0, stats.getTotalFloors());
        assertEquals(0, stats.getTotalRooms());
    }

    @Test
    void shouldGetProjectByIdWhenUserIsOwner() {
        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId)).thenReturn(Collections.emptyList());

        ProjectDetailResponse detail = projectService.getProjectById(projectId, userId);

        assertNotNull(detail);
        assertEquals(projectId, detail.getId());
        assertEquals("The garden apartment", detail.getName());
    }

    @Test
    void shouldThrowExceptionWhenProjectNotOwnedByUser() {
        UUID strangerUserId = UUID.randomUUID();
        when(projectRepository.findByIdAndUserId(projectId, strangerUserId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> projectService.getProjectById(projectId, strangerUserId));
    }

    @Test
    void shouldUpdateProject() {
        UpdateProjectRequest updateRequest = UpdateProjectRequest.builder()
                .name("Renamed Apartment")
                .description("Updated description")
                .unitSystem("FEET")
                .build();

        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId)).thenReturn(Collections.emptyList());

        ProjectResponse response = projectService.updateProject(projectId, userId, updateRequest);

        assertNotNull(response);
        verify(projectRepository).save(project);
    }

    @Test
    void shouldDeleteProject() {
        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));

        projectService.deleteProject(projectId, userId);

        verify(projectRepository).delete(project);
    }

    @Test
    void shouldDuplicateProject() {
        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));

        UUID copyId = UUID.randomUUID();
        Project copy = Project.builder()
                .id(copyId)
                .user(user)
                .name("The garden apartment (Copy)")
                .unitSystem("METERS")
                .build();

        when(projectRepository.save(any(Project.class))).thenReturn(copy);
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId)).thenReturn(Collections.emptyList());
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(copyId)).thenReturn(Collections.emptyList());

        ProjectResponse duplicated = projectService.duplicateProject(projectId, userId);

        assertNotNull(duplicated);
        assertEquals("The garden apartment (Copy)", duplicated.getName());
    }
}
