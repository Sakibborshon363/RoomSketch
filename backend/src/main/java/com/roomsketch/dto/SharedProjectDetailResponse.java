package com.roomsketch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedProjectDetailResponse {
    private UUID id;
    private String name;
    private String description;
    private String unitSystem;
    private String designerName;
    private List<FloorResponse> floors;
    private Instant createdAt;
    private Instant updatedAt;
}
