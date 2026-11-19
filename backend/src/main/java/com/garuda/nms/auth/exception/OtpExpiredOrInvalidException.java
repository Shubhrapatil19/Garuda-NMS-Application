package com.garuda.nms.auth.exception;

/**
 * Thrown when a verification code or one-time login OTP is invalid, expired, or already used.
 */
public class OtpExpiredOrInvalidException extends RuntimeException {
    public OtpExpiredOrInvalidException(String message) {
        super(message);
    }
}
