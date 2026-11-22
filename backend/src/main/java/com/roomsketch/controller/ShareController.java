package com.roomsketch.controller;

import com.roomsketch.dto.ApiResponse;
import com.roomsketch.dto.ShareResponse;
import com.roomsketch.dto.SharedProjectDetailResponse;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping("/api/projects/{projectId}/share")
    public ResponseEntity<ApiResponse<ShareResponse>> getOrCreateShareLink(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        ShareResponse response = shareService.getOrCreateShareLink(projectId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Share link created successfully", response));
    }

    @DeleteMapping("/api/projects/{projectId}/share")
    public ResponseEntity<ApiResponse<Void>> revokeShareLink(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        shareService.revokeShareLink(projectId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Share link revoked successfully", null));
    }

    @GetMapping("/api/shared/{token}")
    public ResponseEntity<ApiResponse<SharedProjectDetailResponse>> getSharedProject(
            @PathVariable String token
    ) {
        SharedProjectDetailResponse response = shareService.getSharedProject(token);
        return ResponseEntity.ok(ApiResponse.ok("Shared project retrieved successfully", response));
    }
}
