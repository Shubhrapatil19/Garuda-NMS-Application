package com.garuda.nms.auth.controller;

import com.garuda.nms.auth.dto.request.*;
import com.garuda.nms.auth.dto.response.ApiResponseDto;
import com.garuda.nms.auth.dto.response.AuthResponseDto;
import com.garuda.nms.auth.dto.response.OrganizationResponseDto;
import com.garuda.nms.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller exposing enterprise authentication endpoints for Garuda NMS.
 * Fully documented with Swagger / OpenAPI 3.0 annotations.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "1. Authentication & Onboarding", description = "Endpoints for Sign In, Sign Up, Customer Organizations, OAuth, and OTPs")
public class AuthController {

    private final AuthService authService;

    // --------------------------------------------------------------------------
    // 1. Customer Organization Dropdown
    // --------------------------------------------------------------------------
    @GetMapping("/organizations")
    @Operation(
            summary = "Get Customer / Organization List",
            description = "Populates the Organization dropdown selector on Sign In & Sign Up screens (e.g. Acme Networks, RevDAU Global)."
    )
    @ApiResponse(responseCode = "200", description = "List of active organizations retrieved successfully")
    public ResponseEntity<ApiResponseDto<List<OrganizationResponseDto>>> getOrganizations() {
        List<OrganizationResponseDto> list = authService.getOrganizations();
        return ResponseEntity.ok(
                ApiResponseDto.<List<OrganizationResponseDto>>builder()
                        .success(true)
                        .message("Organizations retrieved successfully")
                        .data(list)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 2. Send 6-digit Code for Sign Up (Screen 1 "Send Code" Button)
    // --------------------------------------------------------------------------
    @PostMapping("/send-signup-otp")
    @Operation(
            summary = "Send 6-digit Verification Code (Sign Up)",
            description = "Dispatches a 6-digit verification code to the work email for Screen 1 registration."
    )
    @ApiResponse(responseCode = "200", description = "Verification code generated and dispatched")
    @ApiResponse(responseCode = "400", description = "Invalid email format")
    public ResponseEntity<ApiResponseDto<Void>> sendSignUpOtp(@Valid @RequestBody SendOtpRequestDto request) {
        authService.sendSignUpOtp(request);
        return ResponseEntity.ok(
                ApiResponseDto.<Void>builder()
                        .success(true)
                        .message("Verification code has been dispatched to " + request.getEmail() + ". Check server console / inbox.")
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 3. Create Enterprise Account (Screen 1 "Create Enterprise Account ->" Button)
    // --------------------------------------------------------------------------
    @PostMapping("/signup")
    @Operation(
            summary = "Create Enterprise Account (Sign Up - Screen 1)",
            description = "Registers user under Customer Organization with strict password policy and 6-digit OTP verification."
    )
    @ApiResponse(responseCode = "201", description = "Enterprise account created successfully, returns JWT Bearer token")
    @ApiResponse(responseCode = "400", description = "Password policy failure, OTP invalid/expired, or passwords do not match")
    @ApiResponse(responseCode = "409", description = "Work email already registered")
    public ResponseEntity<ApiResponseDto<AuthResponseDto>> signUp(@Valid @RequestBody SignUpRequestDto request) {
        AuthResponseDto response = authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponseDto.<AuthResponseDto>builder()
                        .success(true)
                        .message("Enterprise account successfully created.")
                        .data(response)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 4. Sign In with Password (Screen 2 "Sign In ->" Button)
    // --------------------------------------------------------------------------
    @PostMapping("/signin/password")
    @Operation(
            summary = "Sign In with Password (Screen 2)",
            description = "Authenticates using Organization ID, Email/Username, and Password. Supports 'Remember me' for 7-day token."
    )
    @ApiResponse(responseCode = "200", description = "Sign in successful, returns JWT Bearer token")
    @ApiResponse(responseCode = "401", description = "Invalid organization, username/email, or password")
    public ResponseEntity<ApiResponseDto<AuthResponseDto>> signInWithPassword(@Valid @RequestBody SignInPasswordRequestDto request) {
        AuthResponseDto response = authService.signInWithPassword(request);
        return ResponseEntity.ok(
                ApiResponseDto.<AuthResponseDto>builder()
                        .success(true)
                        .message("Sign in successful. Welcome to Garuda Operations Cloud.")
                        .data(response)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 5. Send One-Time Code for Login (Screen 3)
    // --------------------------------------------------------------------------
    @PostMapping("/send-login-otp")
    @Operation(
            summary = "Send 6-digit One-Time Code (Login)",
            description = "Sends a 6-digit one-time code for passwordless login on Screen 3."
    )
    @ApiResponse(responseCode = "200", description = "One-time code dispatched successfully")
    @ApiResponse(responseCode = "401", description = "No registered enterprise account found for email")
    public ResponseEntity<ApiResponseDto<Void>> sendLoginOtp(@Valid @RequestBody SendOtpRequestDto request) {
        authService.sendLoginOtp(request);
        return ResponseEntity.ok(
                ApiResponseDto.<Void>builder()
                        .success(true)
                        .message("Login one-time code dispatched to " + request.getEmail() + ". Check server console / inbox.")
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 6. Sign In with One-Time Code (Screen 3 "Sign In ->" Button)
    // --------------------------------------------------------------------------
    @PostMapping("/signin/otp")
    @Operation(
            summary = "Sign In with One-Time Code (Screen 3)",
            description = "Passwordless login using Organization ID, Email/Username, and 6-digit OTP code."
    )
    @ApiResponse(responseCode = "200", description = "One-time code sign in successful, returns JWT token")
    @ApiResponse(responseCode = "400", description = "Invalid or expired one-time code")
    @ApiResponse(responseCode = "401", description = "No active account found for organization")
    public ResponseEntity<ApiResponseDto<AuthResponseDto>> signInWithOtp(@Valid @RequestBody SignInOtpRequestDto request) {
        AuthResponseDto response = authService.signInWithOtp(request);
        return ResponseEntity.ok(
                ApiResponseDto.<AuthResponseDto>builder()
                        .success(true)
                        .message("One-time code sign in successful.")
                        .data(response)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 7. Continue with Google / GitHub (Screen 1, 2, 3 Social Buttons)
    // --------------------------------------------------------------------------
    @PostMapping("/oauth")
    @Operation(
            summary = "Continue with Google / GitHub",
            description = "Authenticates or auto-registers users using Google or GitHub OAuth2 tokens. Defaults to 7-day token."
    )
    @ApiResponse(responseCode = "200", description = "OAuth authentication successful, returns JWT token")
    @ApiResponse(responseCode = "401", description = "Unsupported provider or invalid OAuth token")
    public ResponseEntity<ApiResponseDto<AuthResponseDto>> signInWithOAuth(@Valid @RequestBody OAuthSignInRequestDto request) {
        AuthResponseDto response = authService.signInWithOAuth(request);
        return ResponseEntity.ok(
                ApiResponseDto.<AuthResponseDto>builder()
                        .success(true)
                        .message("OAuth sign in successful.")
                        .data(response)
                        .build()
        );
    }
    // --------------------------------------------------------------------------
    // 8. Forgot Password (Send Reset Email with Action Button)
    // --------------------------------------------------------------------------
    @PostMapping("/forgot-password")
    @Operation(
            summary = "Forgot Password (Send Reset Email)",
            description = "Sends an email with a secure reset button to the user's registered email address."
    )
    @ApiResponse(responseCode = "200", description = "Password reset link sent to email")
    @ApiResponse(responseCode = "401", description = "Email not registered")
    public ResponseEntity<ApiResponseDto<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(
                ApiResponseDto.<Void>builder()
                        .success(true)
                        .message("Password reset link has been sent to " + request.getEmail() + ". Please check your inbox.")
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 9. Reset Password (Submit New Password using Token)
    // --------------------------------------------------------------------------
    @PostMapping("/reset-password")
    @Operation(
            summary = "Reset Password (With Token)",
            description = "Resets user password using the secure token received in the reset email."
    )
    @ApiResponse(responseCode = "200", description = "Password reset successfully")
    @ApiResponse(responseCode = "400", description = "Invalid/expired token or password validation failed")
    public ResponseEntity<ApiResponseDto<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponseDto.<Void>builder()
                        .success(true)
                        .message("Your password has been successfully reset. You can now log in with your new password.")
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 10. Change Password (Authenticated User)
    // --------------------------------------------------------------------------
    @PostMapping("/change-password")
    @Operation(
            summary = "Change Password (Logged In User)",
            description = "Allows an authenticated user to change their password by providing current and new password."
    )
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    @ApiResponse(responseCode = "401", description = "Current password is incorrect or unauthorized")
    @ApiResponse(responseCode = "400", description = "New password policy failure or passwords do not match")
    public ResponseEntity<ApiResponseDto<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequestDto request,
            org.springframework.security.core.Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new com.garuda.nms.auth.exception.InvalidCredentialsException("Authentication required to change password.");
        }
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(
                ApiResponseDto.<Void>builder()
                        .success(true)
                        .message("Password has been changed successfully.")
                        .build()
        );
    }
}