package com.garuda.nms.auth.exception;

import com.garuda.nms.auth.dto.response.ApiResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler capturing all application errors and formatting them
 * into standardized, enterprise-compliant JSON response envelopes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Handle DTO Bean Validation Errors (Password rules, @NotBlank, @Email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDto<Map<String, String>>> handleValidationFailures(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponseDto.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed. Please verify the submitted input fields.")
                        .data(errors)
                        .build()
        );
    }

    // 2. Handle User Already Exists (HTTP 409 Conflict)
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponseDto.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
        );
    }

    // 3. Handle Bad Credentials / Unauthorized (HTTP 401 Unauthorized)
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponseDto.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
        );
    }

    // 4. Handle Invalid or Expired OTP (HTTP 400 Bad Request)
    @ExceptionHandler(OtpExpiredOrInvalidException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleOtpException(OtpExpiredOrInvalidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponseDto.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
        );
    }

    // 5. Fallback for any unhandled unexpected exceptions (HTTP 500 Internal Server Error)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDto<Void>> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponseDto.<Void>builder()
                        .success(false)
                        .message("An unexpected internal error occurred in Garuda NMS: " + ex.getMessage())
                        .build()
        );
    }
}