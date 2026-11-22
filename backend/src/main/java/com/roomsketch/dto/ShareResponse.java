package com.roomsketch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareResponse {
    private String shareToken;
    private String shareUrl;
    private Boolean isActive;
    private Instant createdAt;
    private Instant expiresAt;
}
