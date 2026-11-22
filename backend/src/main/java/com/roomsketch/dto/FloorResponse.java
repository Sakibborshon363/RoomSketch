package com.roomsketch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloorResponse {
    private UUID id;
    private UUID projectId;
    private String name;
    private Integer floorNumber;
    private String layoutData;
    private Instant createdAt;
    private Instant updatedAt;
}
