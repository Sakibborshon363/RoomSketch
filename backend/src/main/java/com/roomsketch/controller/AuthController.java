package com.roomsketch.controller;

import com.roomsketch.dto.ApiResponse;
import com.roomsketch.dto.AuthResponse;
import com.roomsketch.dto.LoginRequest;
import com.roomsketch.dto.RegisterRequest;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyToken(@AuthenticationPrincipal UserDetailsImpl userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid or missing token"));
        }
        AuthResponse response = AuthResponse.builder()
                .id(userPrincipal.getId())
                .email(userPrincipal.getUsername())
                .firstName(userPrincipal.getFirstName())
                .lastName(userPrincipal.getLastName())
                .role(userPrincipal.getAuthorities().stream().findFirst().map(Object::toString).orElse("ROLE_USER"))
                .build();
        return ResponseEntity.ok(ApiResponse.ok("Token is valid", response));
    }
}
