package com.roomsketch;

import com.roomsketch.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000L);
    }

    @Test
    void shouldGenerateAndValidateToken() {
        UUID userId = UUID.randomUUID();
        String token = jwtUtils.generateTokenFromUsername("test@roomsketch.com", userId);

        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("test@roomsketch.com", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void shouldRejectInvalidToken() {
        assertFalse(jwtUtils.validateJwtToken("invalid-token-value"));
    }

    @Test
    void shouldHandleShortSecretWithoutWeakKeyException() {
        JwtUtils shortKeyJwt = new JwtUtils();
        ReflectionTestUtils.setField(shortKeyJwt, "jwtSecret", "short");
        ReflectionTestUtils.setField(shortKeyJwt, "jwtExpirationMs", 3600000L);

        UUID userId = UUID.randomUUID();
        String token = shortKeyJwt.generateTokenFromUsername("user@roomsketch.com", userId);
        assertNotNull(token);
        assertTrue(shortKeyJwt.validateJwtToken(token));
        assertEquals("user@roomsketch.com", shortKeyJwt.getUserNameFromJwtToken(token));
    }
}
