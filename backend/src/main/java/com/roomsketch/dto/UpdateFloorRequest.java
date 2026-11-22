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
public class UpdateFloorRequest {

    @NotBlank(message = "Floor name is required")
    private String name;

    private Integer floorNumber;
}
