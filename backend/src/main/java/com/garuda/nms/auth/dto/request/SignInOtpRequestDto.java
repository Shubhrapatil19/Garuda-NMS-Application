package com.garuda.nms.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

/**
 * Data Transfer Object for passwordless authentication using a 6-digit OTP (Screen 3).
 */
@Data
@Schema(description = "Screen 3: One-time Code (OTP) Sign In Payload")
public class SignInOtpRequestDto {

    @NotNull(message = "Organization ID is required")
    @Schema(example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    private UUID organizationId;

    @NotBlank(message = "Username or email is required")
    @Schema(example = "aditi.sharma@company.com")
    private String usernameOrEmail;

    @NotBlank(message = "One-time code is required")
    @Pattern(regexp = "^\\d{6}$", message = "One-time code must be exactly 6 digits")
    @Schema(example = "491023")
    private String oneTimeCode;

    @Schema(description = "If true, token validity extends to 7 days", example = "false")
    private boolean rememberMe;
}