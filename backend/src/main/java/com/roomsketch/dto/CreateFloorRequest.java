package com.roomsketch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFloorRequest {

    @NotBlank(message = "Floor name is required")
    private String name;

    @Builder.Default
    private Integer floorNumber = 1;
}
