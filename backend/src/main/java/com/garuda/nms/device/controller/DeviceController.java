package com.garuda.nms.device.controller;

import com.garuda.nms.auth.dto.response.ApiResponseDto;
import com.garuda.nms.device.dto.request.CreateDeviceRequestDto;
import com.garuda.nms.device.dto.request.TestConnectionRequestDto;
import com.garuda.nms.device.dto.request.UpdateDeviceRequestDto;
import com.garuda.nms.device.dto.response.ConnectionTestResponseDto;
import com.garuda.nms.device.dto.response.DeviceDetailResponseDto;
import com.garuda.nms.device.dto.response.DeviceResponseDto;
import com.garuda.nms.device.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
@Tag(name = "Device Inventory & Onboarding", description = "Enterprise APIs for Hardware Onboarding, Real-time Handshake, and Inventory Management")
public class DeviceController {

    private final DeviceService deviceService;

    // --------------------------------------------------------------------------
    // 1. Fetch Filtered Device Inventory (View 1)
    // --------------------------------------------------------------------------
    @GetMapping
    @Operation(
            summary = "Fetch Filtered Device Inventory",
            description = "Retrieves all network hardware matching live search query, OEM, Type, Status, Polling Method, and Location filters."
    )
    @ApiResponse(responseCode = "200", description = "Devices inventory successfully retrieved")
    public ResponseEntity<ApiResponseDto<List<DeviceResponseDto>>> getDevices(
            @Parameter(description = "Search keyword matching Name, IP, or Location") @RequestParam(required = false) String search,
            @Parameter(description = "OEM Filter (Cisco, Juniper, Huawei, Arista, Fortinet, Palo Alto, All)") @RequestParam(required = false, defaultValue = "All") String oem,
            @Parameter(description = "Device Type (Router, Switch, Firewall, Load Balancer, All)") @RequestParam(required = false, defaultValue = "All") String type,
            @Parameter(description = "Operational Status (Online, Warning, Offline, All)") @RequestParam(required = false, defaultValue = "All") String status,
            @Parameter(description = "Polling Method (SNMP, API, Syslog, Push, Pull, All)") @RequestParam(required = false, defaultValue = "All") String pollingMethod,
            @Parameter(description = "Location Filter (Mumbai, Pune, Nagpur, Ahmedabad, All)") @RequestParam(required = false, defaultValue = "All") String location
    ) {
        List<DeviceResponseDto> devices = deviceService.getAllDevices(search, oem, type, status, pollingMethod, location);
        return ResponseEntity.ok(
                ApiResponseDto.<List<DeviceResponseDto>>builder()
                        .success(true)
                        .message("Device inventory retrieved successfully.")
                        .data(devices)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 2. Fetch Single Device Profile & Polling Config
    // --------------------------------------------------------------------------
    @GetMapping("/{id}")
    @Operation(summary = "Get Device Profile by ID", description = "Fetches complete device profile, credentials, and polling configuration.")
    @ApiResponse(responseCode = "200", description = "Device found and returned")
    @ApiResponse(responseCode = "404", description = "Device ID not found")
    public ResponseEntity<ApiResponseDto<DeviceDetailResponseDto>> getDeviceById(@PathVariable UUID id) {
        DeviceDetailResponseDto detail = deviceService.getDeviceById(id);
        return ResponseEntity.ok(
                ApiResponseDto.<DeviceDetailResponseDto>builder()
                        .success(true)
                        .message("Device details fetched successfully.")
                        .data(detail)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 3. 5-Step Enterprise Onboarding Wizard Submission
    // --------------------------------------------------------------------------
    @PostMapping
    @Operation(
            summary = "Onboard New Device (5-Step Wizard)",
            description = "Registers new hardware in inventory with credentials and telemetry polling settings."
    )
    @ApiResponse(responseCode = "201", description = "Device onboarded successfully")
    @ApiResponse(responseCode = "400", description = "Validation error on submitted fields")
    @ApiResponse(responseCode = "409", description = "Device IP address already registered")
    public ResponseEntity<ApiResponseDto<DeviceResponseDto>> createDevice(@Valid @RequestBody CreateDeviceRequestDto request) {
        DeviceResponseDto created = deviceService.createDevice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponseDto.<DeviceResponseDto>builder()
                        .success(true)
                        .message("Network device onboarded successfully.")
                        .data(created)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 4. Update Existing Device
    // --------------------------------------------------------------------------
    @PutMapping("/{id}")
    @Operation(summary = "Update Device Parameters", description = "Modifies existing device metadata, type, location, or status.")
    @ApiResponse(responseCode = "200", description = "Device successfully updated")
    @ApiResponse(responseCode = "404", description = "Device ID not found")
    public ResponseEntity<ApiResponseDto<DeviceResponseDto>> updateDevice(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDeviceRequestDto request
    ) {
        DeviceResponseDto updated = deviceService.updateDevice(id, request);
        return ResponseEntity.ok(
                ApiResponseDto.<DeviceResponseDto>builder()
                        .success(true)
                        .message("Device parameters updated successfully.")
                        .data(updated)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 5. Delete / Decommission Device
    // --------------------------------------------------------------------------
    @DeleteMapping("/{id}")
    @Operation(summary = "Decommission Device", description = "Permanently deletes a device, its credentials, and polling configs.")
    @ApiResponse(responseCode = "200", description = "Device decommissioned successfully")
    @ApiResponse(responseCode = "404", description = "Device ID not found")
    public ResponseEntity<ApiResponseDto<Void>> deleteDevice(@PathVariable UUID id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.ok(
                ApiResponseDto.<Void>builder()
                        .success(true)
                        .message("Device decommissioned and removed from inventory.")
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 6. Interactive Socket & Ping Handshake Test
    // --------------------------------------------------------------------------
    @PostMapping("/test-connection")
    @Operation(
            summary = "Test Connection Handshake (Wizard Step 2)",
            description = "Performs interactive ICMP ping and socket check from poller to target IP and port."
    )
    @ApiResponse(responseCode = "200", description = "Handshake probe completed (success: true/false)")
    public ResponseEntity<ApiResponseDto<ConnectionTestResponseDto>> testConnection(@Valid @RequestBody TestConnectionRequestDto request) {
        ConnectionTestResponseDto result = deviceService.testConnection(request);
        return ResponseEntity.ok(
                ApiResponseDto.<ConnectionTestResponseDto>builder()
                        .success(true)
                        .message(result.getMessage())
                        .data(result)
                        .build()
        );
    }
}