package com.garuda.nms.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Generic API response envelope ensuring consistent structure across all endpoints.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Standard API Response Wrapper")
public class ApiResponseDto<T> {

    @Schema(example = "true")
    private boolean success;

    @Schema(example = "Operation completed successfully")
    private String message;

    private T data;

    @Builder.Default
    @Schema(example = "2026-11-04T12:00:00Z")
    private Instant timestamp = Instant.now();
}