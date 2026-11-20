package com.garuda.nms.device.exception;

public class ConnectionTestFailedException extends RuntimeException {
    public ConnectionTestFailedException(String message) {
        super(message);
    }
}