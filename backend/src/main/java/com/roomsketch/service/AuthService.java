package com.roomsketch.service;

import com.roomsketch.dto.AuthResponse;
import com.roomsketch.dto.LoginRequest;
import com.roomsketch.dto.RegisterRequest;
import com.roomsketch.entity.User;
import com.roomsketch.exception.BadRequestException;
import com.roomsketch.repository.UserRepository;
import com.roomsketch.security.JwtUtils;
import com.roomsketch.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with email " + normalizedEmail + " already exists");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role("ROLE_USER")
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateTokenFromUsername(savedUser.getEmail(), savedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .role(savedUser.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtUtils.generateJwtToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(userPrincipal.getId())
                .email(userPrincipal.getUsername())
                .firstName(userPrincipal.getFirstName())
                .lastName(userPrincipal.getLastName())
                .role(userPrincipal.getAuthorities().stream()
                        .findFirst()
                        .map(Object::toString)
                        .orElse("ROLE_USER"))
                .build();
    }
}
