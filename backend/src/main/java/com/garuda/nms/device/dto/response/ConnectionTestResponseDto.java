package com.garuda.nms.device.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Interactive Connectivity & Socket Handshake Result")
public class ConnectionTestResponseDto {

    @Schema(description = "Whether the target responded to ICMP/socket handshake", example = "true")
    private boolean success;

    @Schema(description = "Round-Trip Time in milliseconds", example = "14 ms")
    private String rtt;

    @Schema(description = "Detected hardware manufacturer", example = "Cisco")
    private String oemDetected;

    @Schema(description = "Detected Operating System version", example = "IOS-XE 17.09.04")
    private String osVersion;

    @Schema(description = "Handshake status message", example = "Socket handshake successful!")
    private String message;
}