package com.roomsketch;

import com.roomsketch.dto.CreateFloorRequest;
import com.roomsketch.dto.FloorResponse;
import com.roomsketch.dto.UpdateFloorRequest;
import com.roomsketch.dto.UpdateLayoutRequest;
import com.roomsketch.entity.Floor;
import com.roomsketch.entity.Project;
import com.roomsketch.entity.User;
import com.roomsketch.exception.BadRequestException;
import com.roomsketch.exception.ResourceNotFoundException;
import com.roomsketch.repository.FloorRepository;
import com.roomsketch.repository.ProjectRepository;
import com.roomsketch.service.FloorService;
import com.roomsketch.service.TemplateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FloorServiceTest {

    @Mock
    private FloorRepository floorRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TemplateService templateService;

    @InjectMocks
    private FloorService floorService;

    private User user;
    private Project project;
    private Floor floor;
    private UUID userId;
    private UUID projectId;
    private UUID floorId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        projectId = UUID.randomUUID();
        floorId = UUID.randomUUID();

        user = User.builder().id(userId).email("user@roomsketch.com").firstName("User").lastName("One").build();
        project = Project.builder().id(projectId).user(user).name("Test Project").build();
        floor = Floor.builder().id(floorId).project(project).name("Ground floor").floorNumber(1).layoutData("{}").createdAt(Instant.now()).updatedAt(Instant.now()).build();
    }

    @Test
    void shouldAddFloor() {
        CreateFloorRequest request = CreateFloorRequest.builder().name("Second Floor").floorNumber(2).build();

        when(projectRepository.findByIdAndUserId(projectId, userId)).thenReturn(Optional.of(project));
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId)).thenReturn(List.of(floor));
        when(templateService.getBlankLayout()).thenReturn("{}");
        when(floorRepository.save(any(Floor.class))).thenReturn(floor);

        FloorResponse response = floorService.addFloor(projectId, userId, request);
        assertNotNull(response);
        verify(floorRepository).save(any(Floor.class));
    }

    @Test
    void shouldUpdateFloorLayout() {
        UpdateLayoutRequest request = UpdateLayoutRequest.builder().layoutData("{\"version\":1}").build();

        when(floorRepository.findById(floorId)).thenReturn(Optional.of(floor));
        when(floorRepository.save(any(Floor.class))).thenReturn(floor);

        FloorResponse response = floorService.updateFloorLayout(floorId, userId, request);
        assertNotNull(response);
        verify(floorRepository).save(floor);
    }

    @Test
    void shouldThrowWhenDeletingSoleFloor() {
        when(floorRepository.findById(floorId)).thenReturn(Optional.of(floor));
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId)).thenReturn(List.of(floor));

        assertThrows(BadRequestException.class, () -> floorService.deleteFloor(floorId, userId));
    }

    @Test
    void shouldDuplicateFloor() {
        when(floorRepository.findById(floorId)).thenReturn(Optional.of(floor));
        when(floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId)).thenReturn(List.of(floor));
        when(floorRepository.save(any(Floor.class))).thenReturn(floor);

        FloorResponse response = floorService.duplicateFloor(floorId, userId);
        assertNotNull(response);
        verify(floorRepository).save(any(Floor.class));
    }
}
