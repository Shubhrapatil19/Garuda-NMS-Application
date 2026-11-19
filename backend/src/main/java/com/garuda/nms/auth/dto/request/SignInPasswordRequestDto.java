package com.garuda.nms.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * Data Transfer Object for traditional password-based authentication (Screen 2).
 */
@Data
@Schema(description = "Password-based Sign In Payload")
public class SignInPasswordRequestDto {

    @NotNull(message = "Organization ID is required")
    @Schema(example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    private UUID organizationId;

    @NotBlank(message = "Username or email is required")
    @Schema(example = "aditi.sharma@company.com")
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    @Schema(example = "GarudaNms@2026")
    private String password;

    @Schema(description = "If true, token validity extends to 7 days", example = "true")
    private boolean rememberMe;
}