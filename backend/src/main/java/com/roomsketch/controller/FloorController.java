package com.roomsketch.controller;

import com.roomsketch.dto.ApiResponse;
import com.roomsketch.dto.CreateFloorRequest;
import com.roomsketch.dto.FloorResponse;
import com.roomsketch.dto.UpdateFloorRequest;
import com.roomsketch.dto.UpdateLayoutRequest;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.service.FloorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class FloorController {

    private final FloorService floorService;

    @PostMapping("/api/projects/{projectId}/floors")
    public ResponseEntity<ApiResponse<FloorResponse>> addFloor(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody CreateFloorRequest request
    ) {
        FloorResponse response = floorService.addFloor(projectId, userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Floor added successfully", response));
    }

    @PutMapping("/api/floors/{floorId}")
    public ResponseEntity<ApiResponse<FloorResponse>> updateFloor(
            @PathVariable UUID floorId,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody UpdateFloorRequest request
    ) {
        FloorResponse response = floorService.updateFloor(floorId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Floor updated successfully", response));
    }

    @DeleteMapping("/api/floors/{floorId}")
    public ResponseEntity<ApiResponse<Void>> deleteFloor(
            @PathVariable UUID floorId,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        floorService.deleteFloor(floorId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Floor deleted successfully", null));
    }

    @PostMapping("/api/floors/{floorId}/duplicate")
    public ResponseEntity<ApiResponse<FloorResponse>> duplicateFloor(
            @PathVariable UUID floorId,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        FloorResponse response = floorService.duplicateFloor(floorId, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Floor duplicated successfully", response));
    }

    @GetMapping("/api/floors/{floorId}/layout")
    public ResponseEntity<ApiResponse<String>> getFloorLayout(
            @PathVariable UUID floorId,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        String layout = floorService.getFloorLayout(floorId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Layout retrieved successfully", layout));
    }

    @PutMapping("/api/floors/{floorId}/layout")
    public ResponseEntity<ApiResponse<FloorResponse>> updateFloorLayout(
            @PathVariable UUID floorId,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody UpdateLayoutRequest request
    ) {
        FloorResponse response = floorService.updateFloorLayout(floorId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Layout saved successfully", response));
    }
}
