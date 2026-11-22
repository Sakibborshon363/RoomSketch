package com.roomsketch.service;

import com.roomsketch.dto.CreateFloorRequest;
import com.roomsketch.dto.FloorResponse;
import com.roomsketch.dto.UpdateFloorRequest;
import com.roomsketch.dto.UpdateLayoutRequest;
import com.roomsketch.entity.Floor;
import com.roomsketch.entity.Project;
import com.roomsketch.exception.BadRequestException;
import com.roomsketch.exception.ResourceNotFoundException;
import com.roomsketch.repository.FloorRepository;
import com.roomsketch.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FloorService {

    private final FloorRepository floorRepository;
    private final ProjectRepository projectRepository;
    private final TemplateService templateService;

    @Transactional
    public FloorResponse addFloor(UUID projectId, UUID userId, CreateFloorRequest request) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<Floor> existingFloors = floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId);
        int nextFloorNumber = existingFloors.size() + 1;

        String layout = templateService.getBlankLayout();

        Floor floor = Floor.builder()
                .project(project)
                .name(request.getName().trim())
                .floorNumber(request.getFloorNumber() != null ? request.getFloorNumber() : nextFloorNumber)
                .layoutData(layout)
                .build();

        Floor saved = floorRepository.save(floor);
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);

        return mapToResponse(saved);
    }

    @Transactional
    public FloorResponse updateFloor(UUID floorId, UUID userId, UpdateFloorRequest request) {
        Floor floor = getFloorAndVerifyOwnership(floorId, userId);

        floor.setName(request.getName().trim());
        if (request.getFloorNumber() != null) {
            floor.setFloorNumber(request.getFloorNumber());
        }

        Floor saved = floorRepository.save(floor);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteFloor(UUID floorId, UUID userId) {
        Floor floor = getFloorAndVerifyOwnership(floorId, userId);
        UUID projectId = floor.getProject().getId();

        List<Floor> projectFloors = floorRepository.findByProjectIdOrderByFloorNumberAsc(projectId);
        if (projectFloors.size() <= 1) {
            throw new BadRequestException("A project must maintain at least one floor");
        }

        floorRepository.delete(floor);
    }

    @Transactional(readOnly = true)
    public String getFloorLayout(UUID floorId, UUID userId) {
        Floor floor = getFloorAndVerifyOwnership(floorId, userId);
        return floor.getLayoutData() != null ? floor.getLayoutData() : "{}";
    }

    @Transactional
    public FloorResponse updateFloorLayout(UUID floorId, UUID userId, UpdateLayoutRequest request) {
        Floor floor = getFloorAndVerifyOwnership(floorId, userId);

        floor.setLayoutData(request.getLayoutData());
        floor.setUpdatedAt(Instant.now());

        Project project = floor.getProject();
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);

        Floor saved = floorRepository.save(floor);
        return mapToResponse(saved);
    }

    @Transactional
    public FloorResponse duplicateFloor(UUID floorId, UUID userId) {
        Floor floor = getFloorAndVerifyOwnership(floorId, userId);
        Project project = floor.getProject();

        List<Floor> projectFloors = floorRepository.findByProjectIdOrderByFloorNumberAsc(project.getId());
        int nextFloorNumber = projectFloors.size() + 1;

        Floor copy = Floor.builder()
                .project(project)
                .name(floor.getName() + " (Copy)")
                .floorNumber(nextFloorNumber)
                .layoutData(floor.getLayoutData())
                .build();

        Floor saved = floorRepository.save(copy);
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);

        return mapToResponse(saved);
    }

    private Floor getFloorAndVerifyOwnership(UUID floorId, UUID userId) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + floorId));

        if (!floor.getProject().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Floor not found with id: " + floorId);
        }

        return floor;
    }

    private FloorResponse mapToResponse(Floor floor) {
        return FloorResponse.builder()
                .id(floor.getId())
                .projectId(floor.getProject().getId())
                .name(floor.getName())
                .floorNumber(floor.getFloorNumber())
                .layoutData(floor.getLayoutData())
                .createdAt(floor.getCreatedAt())
                .updatedAt(floor.getUpdatedAt())
                .build();
    }
}
