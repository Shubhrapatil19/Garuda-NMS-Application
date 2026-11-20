package com.garuda.nms.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request payload for resetting password using secret token from email.
 */
@Data
@Schema(description = "Payload to reset password using token received via email")
public class ResetPasswordRequestDto {

    @NotBlank(message = "Reset token cannot be empty")
    @Schema(description = "Secure token extracted from email link", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    private String token;

    @NotBlank(message = "New password cannot be empty")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
            message = "Password must be at least 8 characters long, contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)"
    )
    @Schema(example = "NewSecret@2026")
    private String newPassword;

    @NotBlank(message = "Confirm password cannot be empty")
    @Schema(example = "NewSecret@2026")
    private String confirmPassword;
}