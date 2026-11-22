package com.roomsketch;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomsketch.controller.UserController;
import com.roomsketch.dto.ChangePasswordRequest;
import com.roomsketch.dto.UpdateProfileRequest;
import com.roomsketch.dto.UserProfileResponse;
import com.roomsketch.security.JwtUtils;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.security.UserDetailsServiceImpl;
import com.roomsketch.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        UserDetailsImpl userPrincipal = new UserDetailsImpl(
                userId,
                "demo@roomsketch.com",
                "Demo",
                "Architect",
                "password123",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void shouldGetCurrentUserProfile() throws Exception {
        UserProfileResponse response = UserProfileResponse.builder()
                .id(userId)
                .email("demo@roomsketch.com")
                .firstName("Demo")
                .lastName("Architect")
                .role("ROLE_USER")
                .projectCount(3)
                .createdAt(Instant.now())
                .build();

        when(userService.getProfile(userId)).thenReturn(response);

        mockMvc.perform(get("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("demo@roomsketch.com"))
                .andExpect(jsonPath("$.data.firstName").value("Demo"))
                .andExpect(jsonPath("$.data.projectCount").value(3));
    }

    @Test
    void shouldUpdateUserProfile() throws Exception {
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .firstName("Sarah")
                .lastName("Connor")
                .build();

        UserProfileResponse response = UserProfileResponse.builder()
                .id(userId)
                .email("demo@roomsketch.com")
                .firstName("Sarah")
                .lastName("Connor")
                .role("ROLE_USER")
                .projectCount(3)
                .createdAt(Instant.now())
                .build();

        when(userService.updateProfile(eq(userId), any(UpdateProfileRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Sarah"))
                .andExpect(jsonPath("$.data.lastName").value("Connor"));
    }

    @Test
    void shouldChangePassword() throws Exception {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("password123")
                .newPassword("newpassword456")
                .build();

        mockMvc.perform(put("/api/users/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(userService).changePassword(eq(userId), any(ChangePasswordRequest.class));
    }
}

