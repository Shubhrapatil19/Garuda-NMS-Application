package com.garuda.nms.auth.service;

import com.garuda.nms.auth.dto.request.*;
import com.garuda.nms.auth.dto.response.AuthResponseDto;
import com.garuda.nms.auth.dto.response.OrganizationResponseDto;

import java.util.List;

/**
 * Service contract defining enterprise authentication operations.
 */
public interface AuthService {

    /**
     * Retrieves all active customer organizations for dropdown population.
     */
    List<OrganizationResponseDto> getOrganizations();

    /**
     * Generates and dispatches a 6-digit verification code for new user sign up (Screen 1).
     */
    void sendSignUpOtp(SendOtpRequestDto request);

    /**
     * Generates and dispatches a 6-digit one-time code for passwordless login (Screen 3).
     */
    void sendLoginOtp(SendOtpRequestDto request);

    /**
     * Registers a new enterprise account with password hashing and OTP verification (Screen 1).
     */
    AuthResponseDto signUp(SignUpRequestDto request);

    /**
     * Authenticates a user using organization, email/username, and password (Screen 2).
     */
    AuthResponseDto signInWithPassword(SignInPasswordRequestDto request);

    /**
     * Authenticates a user using a 6-digit one-time code (Screen 3).
     */
    AuthResponseDto signInWithOtp(SignInOtpRequestDto request);

    /**
     * Authenticates or auto-registers a user using Google or GitHub OAuth2 credentials.
     */
    AuthResponseDto signInWithOAuth(OAuthSignInRequestDto request);

    /**
     * Sends password reset email with styled button link containing secure UUID token.
     */
    void forgotPassword(ForgotPasswordRequestDto request);

    /**
     * Resets password using token extracted from email link.
     */
    void resetPassword(ResetPasswordRequestDto request);

    /**
     * Changes password for currently authenticated user after verifying current password.
     */
    void changePassword(String userEmail, ChangePasswordRequestDto request);
}