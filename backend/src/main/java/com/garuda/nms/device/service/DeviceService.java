package com.garuda.nms.device.service;

import com.garuda.nms.device.dto.request.CreateDeviceRequestDto;
import com.garuda.nms.device.dto.request.TestConnectionRequestDto;
import com.garuda.nms.device.dto.request.UpdateDeviceRequestDto;
import com.garuda.nms.device.dto.response.ConnectionTestResponseDto;
import com.garuda.nms.device.dto.response.DeviceDetailResponseDto;
import com.garuda.nms.device.dto.response.DeviceResponseDto;

import java.util.List;
import java.util.UUID;

public interface DeviceService {

    // 1. Fetch filtered inventory list matching frontend search & dropdown filters
    List<DeviceResponseDto> getAllDevices(String search, String oem, String type, String status, String pollingMethod, String location);

    // 2. Fetch full device profile by ID
    DeviceDetailResponseDto getDeviceById(UUID id);

    // 3. 5-Step Wizard Onboarding (Saves hardware, credentials & polling config)
    DeviceResponseDto createDevice(CreateDeviceRequestDto request);

    // 4. Update existing device
    DeviceResponseDto updateDevice(UUID id, UpdateDeviceRequestDto request);

    // 5. Delete device from inventory
    void deleteDevice(UUID id);

    // 6. Interactive Socket & ICMP Handshake connection test
    ConnectionTestResponseDto testConnection(TestConnectionRequestDto request);
}