package com.garuda.nms.alert.service.impl;

import com.garuda.nms.alert.dto.request.CreateAlertRuleRequestDto;
import com.garuda.nms.alert.dto.response.AlertEventResponseDto;
import com.garuda.nms.alert.dto.response.AlertKpiResponseDto;
import com.garuda.nms.alert.dto.response.AlertRuleResponseDto;
import com.garuda.nms.alert.entity.AlertEventEntity;
import com.garuda.nms.alert.entity.AlertRuleEntity;
import com.garuda.nms.alert.exception.AlertNotFoundException;
import com.garuda.nms.alert.repository.AlertEventRepository;
import com.garuda.nms.alert.repository.AlertRuleRepository;
import com.garuda.nms.alert.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertEventRepository eventRepository;
    private final AlertRuleRepository ruleRepository;

    @Override
    @Transactional(readOnly = true)
    public AlertKpiResponseDto getKpiMetrics() {
        Long activeAlerts = eventRepository.countActiveAlertsNative();
        Long criticalAlarms = eventRepository.countCriticalAlarmsNative();
        Long openTickets = eventRepository.countOpenTicketsNative();
        Long suppressed = eventRepository.countSuppressedAlertsNative(); // Real DB Query

        return AlertKpiResponseDto.builder()
                .activeAlerts(activeAlerts != null ? activeAlerts : 0L)
                .criticalAlarms(criticalAlarms != null ? criticalAlarms : 0L)
                .openTickets(openTickets != null ? openTickets : 0L)
                .suppressedCount(suppressed != null ? suppressed : 0L) // Real Count (0 if none)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertEventResponseDto> getFilteredEvents(String search, String type, String severity, String timeRange) {
        String effectiveTimeRange = (timeRange != null && !timeRange.isBlank()) ? timeRange : "Last 1 hour";
        List<AlertEventEntity> events = eventRepository.findAllFilteredNative(search, type, severity, effectiveTimeRange);

        return events.stream().map(this::mapToDto).toList();
    }

    @Override
    @Transactional
    public void acknowledgeEvent(UUID id, String userEmail) {
        int updated = eventRepository.acknowledgeEventNative(id, userEmail);
        if (updated == 0) {
            throw new AlertNotFoundException("Alert event not found with ID: " + id);
        }
    }

    @Override
    @Transactional
    public void resolveEvent(UUID id) {
        int updated = eventRepository.resolveEventNative(id);
        if (updated == 0) {
            throw new AlertNotFoundException("Alert event not found with ID: " + id);
        }
    }

    @Override
    @Transactional
    public AlertRuleResponseDto createRule(CreateAlertRuleRequestDto request) {
        AlertRuleEntity rule = AlertRuleEntity.builder()
                .ruleName(request.getRuleName())
                .metricName(request.getMetric())
                .triggerCondition(request.getTriggerCondition())
                .escalationThreshold(request.getEscalationThreshold())
                .actionAutomation(request.getActionAutomation())
                .active(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        AlertRuleEntity saved = ruleRepository.save(rule);

        return AlertRuleResponseDto.builder()
                .id(saved.getId())
                .ruleName(saved.getRuleName())
                .metricName(saved.getMetricName())
                .triggerCondition(saved.getTriggerCondition())
                .escalationThreshold(saved.getEscalationThreshold())
                .actionAutomation(saved.getActionAutomation())
                .isActive(saved.getActive())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertRuleResponseDto> getAllRules() {
        return ruleRepository.findAllActiveRulesNative().stream().map(r ->
                AlertRuleResponseDto.builder()
                        .id(r.getId())
                        .ruleName(r.getRuleName())
                        .metricName(r.getMetricName())
                        .triggerCondition(r.getTriggerCondition())
                        .escalationThreshold(r.getEscalationThreshold())
                        .actionAutomation(r.getActionAutomation())
                        .isActive(r.getActive())
                        .createdAt(r.getCreatedAt())
                        .build()
        ).toList();
    }

    private AlertEventResponseDto mapToDto(AlertEventEntity entity) {
        String timeDisplay = calculateTimeAgo(entity.getCreatedAt());

        return AlertEventResponseDto.builder()
                .id(entity.getId())
                .eventCode(entity.getEventCode())
                .timestamp(entity.getCreatedAt())
                .timestampDisplay(timeDisplay)
                .type(entity.getEventType())
                .severity(entity.getSeverity())
                .sourceDevice(entity.getDeviceName())
                .ruleSource(entity.getRuleSource())
                .impactedEntity(entity.getImpactedEntity())
                .count(entity.getEventCount())
                .status(entity.getStatus())
                .acknowledgedBy(entity.getAcknowledgedBy())
                .build();
    }

    private String calculateTimeAgo(Instant pastTime) {
        if (pastTime == null) return "Just now";
        long minutes = Duration.between(pastTime, Instant.now()).toMinutes();
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " mins ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + " hrs ago";
        return (hours / 24) + " days ago";
    }
}