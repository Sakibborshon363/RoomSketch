package com.roomsketch;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomsketch.controller.ShareController;
import com.roomsketch.dto.FloorResponse;
import com.roomsketch.dto.ShareResponse;
import com.roomsketch.dto.SharedProjectDetailResponse;
import com.roomsketch.security.JwtUtils;
import com.roomsketch.security.UserDetailsImpl;
import com.roomsketch.security.UserDetailsServiceImpl;
import com.roomsketch.service.ShareService;
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

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShareController.class)
@AutoConfigureMockMvc(addFilters = false)
class ShareControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ShareService shareService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    private UUID userId;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        projectId = UUID.randomUUID();

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
    void shouldCreateShareLink() throws Exception {
        ShareResponse response = ShareResponse.builder()
                .shareToken("tok1234567890abc")
                .shareUrl("/shared/tok1234567890abc")
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        when(shareService.getOrCreateShareLink(eq(projectId), eq(userId))).thenReturn(response);

        mockMvc.perform(post("/api/projects/{projectId}/share", projectId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.shareToken").value("tok1234567890abc"))
                .andExpect(jsonPath("$.data.isActive").value(true));
    }

    @Test
    void shouldRevokeShareLink() throws Exception {
        mockMvc.perform(delete("/api/projects/{projectId}/share", projectId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(shareService).revokeShareLink(eq(projectId), eq(userId));
    }

    @Test
    void shouldRetrievePublicSharedProject() throws Exception {
        String token = "tok1234567890abc";
        UUID projectId = UUID.randomUUID();

        FloorResponse floor = FloorResponse.builder()
                .id(UUID.randomUUID())
                .projectId(projectId)
                .name("Ground floor")
                .floorNumber(1)
                .layoutData("{\"rooms\":[]}")
                .createdAt(Instant.now())
                .build();

        SharedProjectDetailResponse response = SharedProjectDetailResponse.builder()
                .id(projectId)
                .name("The garden apartment")
                .description("Sample design")
                .unitSystem("METERS")
                .designerName("Demo Architect")
                .floors(Collections.singletonList(floor))
                .createdAt(Instant.now())
                .build();

        when(shareService.getSharedProject(token)).thenReturn(response);

        mockMvc.perform(get("/api/shared/{token}", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("The garden apartment"))
                .andExpect(jsonPath("$.data.designerName").value("Demo Architect"))
                .andExpect(jsonPath("$.data.floors[0].name").value("Ground floor"));
    }
}
