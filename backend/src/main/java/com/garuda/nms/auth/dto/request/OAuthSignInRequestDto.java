package com.garuda.nms.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * Data Transfer Object for Google and GitHub OAuth2 authentication.
 */
@Data
@Schema(description = "OAuth2 Google / GitHub Sign In Payload")
public class OAuthSignInRequestDto {

    @NotNull(message = "Organization ID is required")
    @Schema(example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    private UUID organizationId;

    @NotBlank(message = "OAuth Provider is required (GOOGLE or GITHUB)")
    @Schema(example = "GOOGLE")
    private String provider;

    @NotBlank(message = "OAuth token or authorization code is required")
    @Schema(example = "ya29.a0AfH6SMA...")
    private String idToken;

    @Schema(description = "User's email received from OAuth provider", example = "aditi.sharma@company.com")
    private String email;

    @Schema(description = "User's full name received from OAuth provider", example = "Aditi Sharma")
    private String fullName;
}