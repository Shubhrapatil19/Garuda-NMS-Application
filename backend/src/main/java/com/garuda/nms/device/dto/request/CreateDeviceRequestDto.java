package com.garuda.nms.device.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

@Data
@Schema(description = "5-Step Enterprise Device Onboarding Payload")
public class CreateDeviceRequestDto {

    @NotNull(message = "Organization ID is required")
    @Schema(description = "Associated customer/organization UUID", example = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22")
    private UUID organizationId;

    // Step 1: Device Information
    @NotBlank(message = "Device name is required")
    @Schema(description = "Logical identifier of the device", example = "Core-Edge-Mumbai-05")
    private String name;

    @NotBlank(message = "Hostname is required")
    @Schema(description = "Fully Qualified Domain Name (FQDN)", example = "mumbai-core-gw-05.corp.net")
    private String hostname;

    @NotBlank(message = "IP address is required")
    @Pattern(regexp = "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)(\\.(?!$)|$)){4}$", message = "Invalid IPv4 address format")
    @Schema(description = "Management IPv4 address", example = "10.200.18.5")
    private String ip;

    @NotBlank(message = "OEM is required")
    @Schema(description = "Hardware manufacturer (Cisco, Juniper, Huawei, Arista, etc.)", example = "Cisco")
    private String oem;

    @NotBlank(message = "Device type is required")
    @Schema(description = "Hardware category (Router, Switch, Firewall, Load Balancer)", example = "Router")
    private String type;

    @NotBlank(message = "Location is required")
    @Schema(description = "Physical Datacenter or PoP site location", example = "Mumbai Datacenter DC-1")
    private String location;

    @Schema(description = "Deployment tier (Production, Staging, DR Node)", example = "Production")
    private String environment = "Production";

    // Step 2: Connectivity
    @Schema(description = "Management transport IP", example = "10.200.18.5")
    private String mgmtIp;

    @Schema(description = "Management transport port", example = "161")
    private Integer port = 161;

    @Schema(description = "Transport protocol", example = "SSH / SNMP")
    private String protocol = "SSH / SNMP";

    @Schema(description = "Administrative username", example = "nms_admin_prod")
    private String username;

    @Schema(description = "Cryptographic authentication cipher", example = "SHA-256 + AES-256")
    private String authMethod = "SHA-256 + AES-256";

    @Schema(description = "Administrative secret or community credential", example = "Secr3tP@ss2026")
    private String credential;

    // Step 3: Data Collection Method
    @Schema(description = "Primary ingestion protocol (SNMP, REST API, Syslog, Push, Pull)", example = "SNMP")
    private String collectionMethod = "SNMP";

    // Step 4: Polling Configuration
    @Schema(description = "SNMP protocol version (v2c, v3)", example = "v3")
    private String snmpVersion = "v3";

    @Schema(description = "SNMP Read-Only community string", example = "public_garuda_ro")
    private String snmpCommunity = "public_garuda_ro";

    @Schema(description = "SNMP Context Engine or VRF Name", example = "Carrier-VRF-01")
    private String snmpContext;

    @Schema(description = "Telemetry polling frequency in seconds", example = "60")
    private Integer pollingFrequency = 60;

    @Schema(description = "Network socket timeout in seconds", example = "5")
    private Integer timeoutSec = 5;

    @Schema(description = "Number of retry attempts upon packet loss", example = "3")
    private Integer retries = 3;

    @Schema(description = "RESTCONF/HTTP API endpoint", example = "https://10.200.18.5/restconf/data")
    private String apiEndpoint;

    @Schema(description = "API bearer token or basic auth header")
    private String apiAuthToken;

    @Schema(description = "Syslog logging facility (RFC 5424)", example = "local7")
    private String syslogFacility = "local7";

    @Schema(description = "UDP Syslog ingestion port", example = "514")
    private Integer syslogPort = 514;
}