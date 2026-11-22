package com.roomsketch.controller;

import com.roomsketch.dto.*;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String search
    ) {
        List<ProjectResponse> projects = projectService.getAllProjects(userPrincipal.getId(), sort, search);
        return ResponseEntity.ok(ApiResponse.ok("Projects retrieved successfully", projects));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody CreateProjectRequest request
    ) {
        ProjectResponse response = projectService.createProject(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> getProjectById(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @PathVariable UUID id
    ) {
        ProjectDetailResponse response = projectService.getProjectById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project details retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request
    ) {
        ProjectResponse response = projectService.updateProject(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @PathVariable UUID id
    ) {
        projectService.deleteProject(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ApiResponse<ProjectResponse>> duplicateProject(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @PathVariable UUID id
    ) {
        ProjectResponse response = projectService.duplicateProject(id, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project duplicated successfully", response));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        DashboardStatsResponse response = projectService.getDashboardStats(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics retrieved successfully", response));
    }
}
