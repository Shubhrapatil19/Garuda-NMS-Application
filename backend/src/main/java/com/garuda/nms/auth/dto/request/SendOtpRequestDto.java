package com.garuda.nms.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Data Transfer Object for requesting a 6-digit verification code.
 */
@Data
@Schema(description = "Send 6-digit Verification / Login OTP Request")
public class SendOtpRequestDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(example = "aditi.sharma@company.com")
    private String email;
}