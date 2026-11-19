package com.garuda.nms.device.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Clean Device Inventory Representation for Frontend Table")
public class DeviceResponseDto {

    @Schema(example = "d1111111-1111-1111-1111-111111111111")
    private UUID id;

    @Schema(example = "Core-Edge-Mumbai-05")
    private String name;

    @Schema(example = "Cisco")
    private String oem;

    @Schema(example = "Router")
    private String type;

    @Schema(example = "10.200.18.5")
    private String ip;

    @Schema(example = "Mumbai Datacenter DC-1")
    private String location;

    @Schema(description = "Operational status: Online, Warning, Offline", example = "Online")
    private String status;

    @Schema(example = "SNMP")
    private String pollingMethod;

    @Schema(example = "Just now")
    private String lastPoll;

    @Schema(example = "100%")
    private String health;
}