package com.garuda.nms.device.exception;

public class DeviceAlreadyExistsException extends RuntimeException {
    public DeviceAlreadyExistsException(String message) {
        super(message);
    }
}