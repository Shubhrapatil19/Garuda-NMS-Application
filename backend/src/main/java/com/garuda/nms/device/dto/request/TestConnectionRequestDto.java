package com.garuda.nms.device.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Interactive Socket & Ping Handshake Verification Payload")
public class TestConnectionRequestDto {

    @NotBlank(message = "Target IP address is required")
    @Schema(description = "Target management IPv4 or FQDN to test reachability", example = "10.200.18.5")
    private String ip;

    @Schema(description = "Target port to probe socket connection", example = "161")
    private Integer port = 161;

    @Schema(description = "Protocol to verify (SSH / SNMP, RESTCONF)", example = "SSH / SNMP")
    private String protocol = "SSH / SNMP";

    @Schema(description = "Device OEM to aid in signature detection", example = "Cisco")
    private String oem = "Cisco";
}