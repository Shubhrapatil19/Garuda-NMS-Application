package com.garuda.nms.device.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Full Comprehensive Device Profile with Credentials and Telemetry Settings")
public class DeviceDetailResponseDto {

    // 1. Basic Hardware Details
    @Schema(example = "d1111111-1111-1111-1111-111111111111")
    private UUID id;

    @Schema(example = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22")
    private UUID organizationId;

    @Schema(example = "Core-Edge-Mumbai-05")
    private String name;

    @Schema(example = "mumbai-core-gw-05.corp.net")
    private String hostname;

    @Schema(example = "10.200.18.5")
    private String ip;

    @Schema(example = "Cisco")
    private String oem;

    @Schema(example = "Router")
    private String type;

    @Schema(example = "Mumbai Datacenter DC-1")
    private String location;

    @Schema(example = "Production")
    private String environment;

    @Schema(example = "Online")
    private String status;

    @Schema(example = "SNMP")
    private String pollingMethod;

    @Schema(example = "100")
    private Integer healthPercentage;

    @Schema(example = "2026-11-17T14:30:00Z")
    private Instant lastPolledAt;

    // 2. Connectivity & Credentials (Masked)
    @Schema(example = "10.200.18.5")
    private String managementIp;

    @Schema(example = "161")
    private Integer managementPort;

    @Schema(example = "SSH / SNMP")
    private String protocol;

    @Schema(example = "nms_admin_prod")
    private String username;

    @Schema(example = "SHA-256 + AES-256")
    private String authMethod;

    // 3. Polling Configuration
    @Schema(example = "v3")
    private String snmpVersion;

    @Schema(example = "public_garuda_ro")
    private String snmpCommunity;

    @Schema(example = "Carrier-VRF-01")
    private String snmpContext;

    @Schema(example = "60")
    private Integer pollingFrequencySec;

    @Schema(example = "5")
    private Integer timeoutSec;

    @Schema(example = "3")
    private Integer retries;

    @Schema(example = "https://10.200.18.5/restconf/data")
    private String apiEndpoint;
}