package com.garuda.nms.device.exception;

import com.garuda.nms.auth.dto.response.ApiResponseDto;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Dedicated Exception Handler for Device Onboarding & Inventory Module.
 * Catches domain-specific exceptions and maps them to standard HTTP status codes.
 */
@RestControllerAdvice(basePackages = "com.garuda.nms.device.controller")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DeviceExceptionHandler {

    // 1. Handle Duplicate Device IP (HTTP 409 Conflict)
    @ExceptionHandler(DeviceAlreadyExistsException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleDeviceAlreadyExists(DeviceAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponseDto.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
        );
    }

    // 2. Handle Device Not Found (HTTP 404 Not Found)
    @ExceptionHandler(DeviceNotFoundException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleDeviceNotFound(DeviceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponseDto.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
        );
    }

    // 3. Handle Socket / ICMP Connection Test Failure (HTTP 400 Bad Request)
    @ExceptionHandler(ConnectionTestFailedException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleConnectionTestFailed(ConnectionTestFailedException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponseDto.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
        );
    }
}