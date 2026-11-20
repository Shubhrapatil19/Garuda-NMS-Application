package com.garuda.nms.alert.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AlertRuleResponseDto {
    private UUID id;
    private String ruleName;
    private String metricName;
    private String triggerCondition;
    private String escalationThreshold;
    private String actionAutomation;
    private Boolean isActive;
    private Instant createdAt;
}