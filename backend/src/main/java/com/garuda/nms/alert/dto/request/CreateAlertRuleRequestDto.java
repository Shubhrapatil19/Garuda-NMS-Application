package com.garuda.nms.alert.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request payload for creating an automated alert engine rule (from Rule Builder Modal).
 */
@Data
@Schema(description = "Payload to create an Alert Escalation & Automation Rule")
public class CreateAlertRuleRequestDto {

    @NotBlank(message = "Rule name is required")
    @Schema(example = "Core Router High CPU Escalation")
    private String ruleName;

    @NotBlank(message = "Monitored metric is required")
    @Schema(example = "cpu_usage")
    private String metric;

    @NotBlank(message = "Trigger condition is required")
    @Schema(example = "Greater than or equal to 80% for 2 consecutive polls → Generates Alert")
    private String triggerCondition;

    @NotBlank(message = "Escalation threshold is required")
    @Schema(example = "If condition persists for > 5 minutes without acknowledgment → Escalates to Alarm")
    private String escalationThreshold;

    @NotBlank(message = "Action automation is required")
    @Schema(example = "If Alarm severity is CRITICAL and unacknowledged for > 15 minutes → Auto-creates ITSM Ticket")
    private String actionAutomation;
}