package com.garuda.nms.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request payload for changing password by an authenticated logged-in user.
 */
@Data
@Schema(description = "Payload for authenticated user password change")
public class ChangePasswordRequestDto {

    @NotBlank(message = "Current password cannot be empty")
    @Schema(example = "GarudaNms@2026")
    private String currentPassword;

    @NotBlank(message = "New password cannot be empty")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
            message = "Password must be at least 8 characters long, contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)"
    )
    @Schema(example = "BrandNew@2026")
    private String newPassword;

    @NotBlank(message = "Confirm password cannot be empty")
    @Schema(example = "BrandNew@2026")
    private String confirmPassword;
}