package com.garuda.nms.alert.service;

import com.garuda.nms.alert.dto.request.CreateAlertRuleRequestDto;
import com.garuda.nms.alert.dto.response.AlertEventResponseDto;
import com.garuda.nms.alert.dto.response.AlertKpiResponseDto;
import com.garuda.nms.alert.dto.response.AlertRuleResponseDto;

import java.util.List;
import java.util.UUID;

public interface AlertService {
    AlertKpiResponseDto getKpiMetrics();
    List<AlertEventResponseDto> getFilteredEvents(String search, String type, String severity, String timeRange);
    void acknowledgeEvent(UUID id, String userEmail);
    void resolveEvent(UUID id);
    AlertRuleResponseDto createRule(CreateAlertRuleRequestDto request);
    List<AlertRuleResponseDto> getAllRules();
}