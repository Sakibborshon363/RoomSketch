package com.roomsketch;

import com.roomsketch.dto.AuthResponse;
import com.roomsketch.dto.LoginRequest;
import com.roomsketch.dto.RegisterRequest;
import com.roomsketch.entity.User;
import com.roomsketch.exception.BadRequestException;
import com.roomsketch.repository.UserRepository;
import com.roomsketch.security.JwtUtils;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .email("designer@roomsketch.com")
                .password("secret123")
                .firstName("Alice")
                .lastName("Smith")
                .build();

        loginRequest = LoginRequest.builder()
                .email("designer@roomsketch.com")
                .password("secret123")
                .build();
    }

    @Test
    void shouldRegisterNewUserSuccessfully() {
        when(userRepository.existsByEmail("designer@roomsketch.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encodedPassword");

        UUID generatedId = UUID.randomUUID();
        User savedUser = User.builder()
                .id(generatedId)
                .email("designer@roomsketch.com")
                .passwordHash("encodedPassword")
                .firstName("Alice")
                .lastName("Smith")
                .role("ROLE_USER")
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtils.generateTokenFromUsername("designer@roomsketch.com", generatedId)).thenReturn("mockJwtToken");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("designer@roomsketch.com", response.getEmail());
        assertEquals("Alice", response.getFirstName());
        assertEquals("Smith", response.getLastName());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenRegisteringExistingEmail() {
        when(userRepository.existsByEmail("designer@roomsketch.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldLoginSuccessfully() {
        UUID userId = UUID.randomUUID();
        UserDetailsImpl userPrincipal = new UserDetailsImpl(
                userId,
                "designer@roomsketch.com",
                "Alice",
                "Smith",
                "encodedPassword",
                Collections.emptyList()
        );

        Authentication authResult = mock(Authentication.class);
        when(authResult.getPrincipal()).thenReturn(userPrincipal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authResult);
        when(jwtUtils.generateJwtToken(authResult)).thenReturn("mockLoginToken");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mockLoginToken", response.getToken());
        assertEquals("designer@roomsketch.com", response.getEmail());
    }
}
