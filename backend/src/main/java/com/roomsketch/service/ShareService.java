package com.roomsketch.service;

import com.roomsketch.dto.FloorResponse;
import com.roomsketch.dto.ShareResponse;
import com.roomsketch.dto.SharedProjectDetailResponse;
import com.roomsketch.entity.Floor;
import com.roomsketch.entity.Project;
import com.roomsketch.entity.SharedProject;
import com.roomsketch.exception.ResourceNotFoundException;
import com.roomsketch.repository.FloorRepository;
import com.roomsketch.repository.ProjectRepository;
import com.roomsketch.repository.SharedProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final SharedProjectRepository sharedProjectRepository;
    private final ProjectRepository projectRepository;
    private final FloorRepository floorRepository;

    @Transactional
    public ShareResponse getOrCreateShareLink(UUID projectId, UUID userId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        SharedProject sharedProject = sharedProjectRepository.findByProjectId(projectId)
                .orElse(null);

        if (sharedProject == null) {
            String token = UUID.randomUUID().toString().replace("-", "");
            sharedProject = SharedProject.builder()
                    .project(project)
                    .shareToken(token)
                    .isActive(true)
                    .build();
            sharedProject = sharedProjectRepository.save(sharedProject);
        } else if (!Boolean.TRUE.equals(sharedProject.getIsActive())) {
            sharedProject.setIsActive(true);
            sharedProject = sharedProjectRepository.save(sharedProject);
        }

        return mapToShareResponse(sharedProject);
    }

    @Transactional
    public void revokeShareLink(UUID projectId, UUID userId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        sharedProjectRepository.findByProjectId(projectId).ifPresent(sp -> {
            sp.setIsActive(false);
            sharedProjectRepository.save(sp);
        });
    }

    @Transactional(readOnly = true)
    public SharedProjectDetailResponse getSharedProject(String shareToken) {
        SharedProject sharedProject = sharedProjectRepository.findByShareTokenAndIsActiveTrue(shareToken)
                .orElseThrow(() -> new ResourceNotFoundException("Shared floor plan link is invalid or has expired"));

        Project project = sharedProject.getProject();
        List<Floor> floors = floorRepository.findByProjectIdOrderByFloorNumberAsc(project.getId());

        List<FloorResponse> floorResponses = floors.stream()
                .map(f -> FloorResponse.builder()
                        .id(f.getId())
                        .projectId(project.getId())
                        .name(f.getName())
                        .floorNumber(f.getFloorNumber())
                        .layoutData(f.getLayoutData())
                        .createdAt(f.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        String designerName = "";
        if (project.getUser() != null) {
            String first = project.getUser().getFirstName() != null ? project.getUser().getFirstName() : "";
            String last = project.getUser().getLastName() != null ? project.getUser().getLastName() : "";
            designerName = (first + " " + last).trim();
            if (designerName.isEmpty()) {
                designerName = "RoomSketch Architect";
            }
        }

        return SharedProjectDetailResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .unitSystem(project.getUnitSystem() != null ? project.getUnitSystem() : "METERS")
                .designerName(designerName)
                .floors(floorResponses)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private ShareResponse mapToShareResponse(SharedProject sp) {
        return ShareResponse.builder()
                .shareToken(sp.getShareToken())
                .shareUrl("/shared/" + sp.getShareToken())
                .isActive(sp.getIsActive())
                .createdAt(sp.getCreatedAt())
                .expiresAt(sp.getExpiresAt())
                .build();
    }
}
