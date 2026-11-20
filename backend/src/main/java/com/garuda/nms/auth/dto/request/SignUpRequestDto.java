package com.garuda.nms.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Data Transfer Object for enterprise user registration (Screen 1 / Signup).
 * Organization is automatically derived from the work email domain (e.g. @revdau.ai).
 */
@Data
@Schema(description = "Enterprise Signup Request Payload (Screen 1)")
public class SignUpRequestDto {

    @NotBlank(message = "Full Name cannot be empty")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Schema(example = "Aditi Sharma")
    private String fullName;

    @NotBlank(message = "Work Email cannot be empty")
    @Email(message = "Invalid work email format")
    @Schema(example = "aditi.sharma@revdau.ai")
    private String workEmail;

    @NotBlank(message = "Password cannot be empty")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
            message = "Password must be at least 8 characters long, contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)"
    )
    @Schema(example = "GarudaNms@2026")
    private String password;

    @NotBlank(message = "Confirm Password cannot be empty")
    @Schema(example = "GarudaNms@2026")
    private String confirmPassword;

    @NotBlank(message = "Verification code is required")
    @Pattern(regexp = "^\\d{6}$", message = "Verification code must be exactly 6 digits")
    @Schema(example = "491023")
    private String verificationCode;

    private boolean agreeToTerms;
}