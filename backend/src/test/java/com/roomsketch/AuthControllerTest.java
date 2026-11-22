package com.roomsketch;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomsketch.controller.AuthController;
import com.roomsketch.dto.AuthResponse;
import com.roomsketch.dto.LoginRequest;
import com.roomsketch.dto.RegisterRequest;
import com.roomsketch.security.JwtUtils;
import com.roomsketch.security.UserDetailsServiceImpl;
import com.roomsketch.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void shouldRegisterUser() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@roomsketch.com")
                .password("password123")
                .firstName("John")
                .lastName("Doe")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .token("jwt-token-xyz")
                .id(UUID.randomUUID())
                .email("test@roomsketch.com")
                .firstName("John")
                .lastName("Doe")
                .role("ROLE_USER")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token-xyz"))
                .andExpect(jsonPath("$.data.email").value("test@roomsketch.com"));
    }

    @Test
    void shouldLoginUser() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@roomsketch.com")
                .password("password123")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .token("jwt-token-xyz")
                .id(UUID.randomUUID())
                .email("test@roomsketch.com")
                .firstName("John")
                .lastName("Doe")
                .role("ROLE_USER")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token-xyz"));
    }
}
