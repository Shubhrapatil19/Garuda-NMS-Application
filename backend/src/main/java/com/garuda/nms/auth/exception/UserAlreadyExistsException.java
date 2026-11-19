package com.garuda.nms.auth.exception;

/**
 * Thrown when a user attempts to register with an email that is already in use.
 */
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}