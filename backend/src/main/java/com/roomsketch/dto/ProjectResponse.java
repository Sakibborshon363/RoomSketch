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
public class ProjectResponse {
    private UUID id;
    private String name;
    private String description;
    private String unitSystem;
    private String thumbnailData;
    private int floorCount;
    private int roomCount;
    private double totalArea;
    private Instant createdAt;
    private Instant updatedAt;
}
