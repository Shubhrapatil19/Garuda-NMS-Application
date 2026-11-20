package com.garuda.nms.alert.exception;

import com.garuda.nms.auth.dto.response.ApiResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AlertExceptionHandler {

    @ExceptionHandler(AlertNotFoundException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleAlertNotFound(AlertNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponseDto.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()
        );
    }
}