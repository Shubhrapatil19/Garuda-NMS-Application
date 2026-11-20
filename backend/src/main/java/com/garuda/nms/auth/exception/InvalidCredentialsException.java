package com.garuda.nms.auth.exception;

/**
 * Thrown when login fails due to incorrect password, inactive account, or mismatched organization.
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}