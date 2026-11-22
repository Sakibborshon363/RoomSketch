package com.roomsketch;

import com.roomsketch.dto.ShareResponse;
import com.roomsketch.dto.SharedProjectDetailResponse;
import com.roomsketch.entity.Floor;
import com.roomsketch.entity.Project;
import com.roomsketch.entity.SharedProject;
import com.roomsketch.entity.User;
import com.roomsketch.exception.ResourceNotFoundException;
import com.roomsketch.repository.FloorRepository;
import com.roomsketch.repository.ProjectRepository;
import com.roomsketch.repository.SharedProjectRepository;
import com.roomsketch.service.ShareService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShareServiceTest {

    @Mock
    private SharedProjectRepository sharedProjectRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private FloorRepository floorRepository;

    @InjectMocks
    private ShareService shareService;

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
                .email("demo@roomsketch.com")
                .firstName("Sarah")
                .lastName("Connor")
                .build();

        project = Project.builder()
                .id(projectId)
                .user(user)
                .name("Modern Loft")
                .description("Sample design")
                .unitSystem("METERS")
                .build();
    }

    @Test
    void shouldCreateNewShareLinkWhenNoneExists() {
        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));
        when(sharedProjectRepository.findByProjectId(projectId)).thenReturn(Optional.empty());
        when(sharedProjectRepository.save(any(SharedProject.class))).thenAnswer(invocation -> {
            SharedProject sp = invocation.getArgument(0);
            sp.setId(UUID.randomUUID());
            sp.setCreatedAt(Instant.now());
            return sp;
        });

        ShareResponse response = shareService.getOrCreateShareLink(projectId, userId);

        assertNotNull(response);
        assertNotNull(response.getShareToken());
        assertTrue(response.getShareUrl().contains("/shared/"));
        assertTrue(response.getIsActive());
        verify(sharedProjectRepository, times(1)).save(any(SharedProject.class));
    }

    @Test
    void shouldReactivateExistingInactiveShareLink() {
        SharedProject inactiveSp = SharedProject.builder()
                .id(UUID.randomUUID())
                .project(project)
                .shareToken("existingtoken123")
                .isActive(false)
                .createdAt(Instant.now())
                .build();

        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));
        when(sharedProjectRepository.findByProjectId(projectId)).thenReturn(Optional.of(inactiveSp));
        when(sharedProjectRepository.save(any(SharedProject.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ShareResponse response = shareService.getOrCreateShareLink(projectId, userId);

        assertNotNull(response);
        assertEquals("existingtoken123", response.getShareToken());
        assertTrue(response.getIsActive());
    }

    @Test
    void shouldRevokeShareLink() {
        SharedProject activeSp = SharedProject.builder()
                .id(UUID.randomUUID())
                .project(project)
                .shareToken("activetoken123")
                .isActive(true)
                .build();

        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));
        when(sharedProjectRepository.findByProjectId(projectId)).thenReturn(Optional.of(activeSp));

        shareService.revokeShareLink(projectId, userId);

        assertFalse(activeSp.getIsActive());
        verify(sharedProjectRepository, times(1)).save(activeSp);
    }

    @Test
    void shouldRetrievePublicSharedProjectByToken() {
        SharedProject sp = SharedProject.builder()
                .id(UUID.randomUUID())
                .project(project)
                .shareToken("publictoken123")
                .isActive(true)
                .build();

        Floor floor = Floor.builder()
                .id(UUID.randomUUID())
                .project(project)
                .name("Ground floor")
                .floorNumber(1)
                .layoutData("{\"rooms\":[]}")
                .createdAt(Instant.now())
                .build();

        when(sharedProjectRepository.findByShareTokenAndIsActiveTrue("publictoken123")).thenReturn(Optional.of(sp));
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId)).thenReturn(Collections.singletonList(floor));

        SharedProjectDetailResponse response = shareService.getSharedProject("publictoken123");

        assertNotNull(response);
        assertEquals("Modern Loft", response.getName());
        assertEquals("Sarah Connor", response.getDesignerName());
        assertEquals(1, response.getFloors().size());
        assertEquals("Ground floor", response.getFloors().get(0).getName());
    }

    @Test
    void shouldThrowWhenTokenIsInvalid() {
        when(sharedProjectRepository.findByShareTokenAndIsActiveTrue("invalidtoken")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> shareService.getSharedProject("invalidtoken"));
    }
}
