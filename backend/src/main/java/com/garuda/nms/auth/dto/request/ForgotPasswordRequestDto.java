package com.garuda.nms.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request payload for initiating password reset.
 */
@Data
@Schema(description = "Payload to request password reset link")
public class ForgotPasswordRequestDto {

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    @Schema(example = "gauravmahale103@gmail.com")
    private String email;
}