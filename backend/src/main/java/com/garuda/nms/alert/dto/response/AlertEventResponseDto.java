package com.garuda.nms.alert.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

/**
 * Event table row matching frontend Event Triage Data Grid.
 */
@Data
@Builder
@Schema(description = "Alert Event table row representation")
public class AlertEventResponseDto {

    private UUID id;

    @Schema(example = "ALT-9042")
    private String eventCode;

    @Schema(example = "2 mins ago")
    private String timestampDisplay;

    private Instant timestamp;

    @Schema(example = "Alert")
    private String type; // 'Alert', 'Alarm', 'Ticket'

    @Schema(example = "Critical")
    private String severity; // 'Critical', 'Warning', 'Info', 'Low'

    @Schema(example = "Firewall-01")
    private String sourceDevice;

    @Schema(example = "CPU utilization > 80% (Soft Threshold)")
    private String ruleSource;

    @Schema(example = "Module: FortiOS Core-0")
    private String impactedEntity;

    @Schema(example = "3")
    private Integer count;

    @Schema(example = "OPEN")
    private String status; // 'OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'

    private String acknowledgedBy;
}
