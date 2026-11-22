package com.roomsketch.controller;

import com.roomsketch.dto.ApiResponse;
import com.roomsketch.dto.ChangePasswordRequest;
import com.roomsketch.dto.UpdateProfileRequest;
import com.roomsketch.dto.UserProfileResponse;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal
    ) {
        UserProfileResponse response = userService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UserProfileResponse response = userService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", response));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
