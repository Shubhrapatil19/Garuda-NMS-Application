package com.garuda.nms.device.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Payload for Updating Existing Device Parameters & Configuration")
public class UpdateDeviceRequestDto {

    @NotBlank(message = "Device name is required")
    @Schema(description = "Updated logical name of the device", example = "Core-Edge-Mumbai-05-Updated")
    private String name;

    @Schema(description = "Hardware category", example = "Router")
    private String type;

    @NotBlank(message = "Location is required")
    @Schema(description = "Updated Datacenter or PoP location", example = "Mumbai Datacenter DC-2")
    private String location;

    @Schema(description = "Deployment environment", example = "Production")
    private String environment;

    @Schema(description = "Administrative status (Online, Warning, Offline)", example = "Online")
    private String status;

    @Schema(description = "Data collection mechanism", example = "SNMP")
    private String pollingMethod;

    @Schema(description = "SNMP Community string", example = "public_garuda_ro")
    private String snmpCommunity;

    @Schema(description = "Polling frequency in seconds", example = "60")
    private Integer pollingFrequency;
}