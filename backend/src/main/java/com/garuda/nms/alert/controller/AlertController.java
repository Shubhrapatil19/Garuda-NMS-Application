package com.garuda.nms.alert.controller;

import com.garuda.nms.alert.dto.request.CreateAlertRuleRequestDto;
import com.garuda.nms.alert.dto.response.AlertEventResponseDto;
import com.garuda.nms.alert.dto.response.AlertKpiResponseDto;
import com.garuda.nms.alert.dto.response.AlertRuleResponseDto;
import com.garuda.nms.alert.service.AlertService;
import com.garuda.nms.auth.dto.response.ApiResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alert Engine & Triage Center", description = "Real-time Event Correlation, Incident Triage, and Automation Rule APIs")
public class AlertController {

    private final AlertService alertService;

    // --------------------------------------------------------------------------
    // 1. Get Summary KPI Cards (Active Alerts, Critical Alarms, Open Tickets)
    // --------------------------------------------------------------------------
    @GetMapping("/kpi")
    @Operation(summary = "Get Summary KPI Metrics", description = "Populates the 4 KPI cards at the top of Alert Engine dashboard.")
    @ApiResponse(responseCode = "200", description = "KPI metrics retrieved successfully")
    public ResponseEntity<ApiResponseDto<AlertKpiResponseDto>> getKpiMetrics() {
        AlertKpiResponseDto kpi = alertService.getKpiMetrics();
        return ResponseEntity.ok(
                ApiResponseDto.<AlertKpiResponseDto>builder()
                        .success(true)
                        .message("Alert KPIs retrieved successfully.")
                        .data(kpi)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 2. Fetch Filtered Event Triage Grid
    // --------------------------------------------------------------------------
    @GetMapping
    @Operation(summary = "Fetch Filtered Alert Events", description = "Filters events by keyword search, component type, severity, and time range.")
    @ApiResponse(responseCode = "200", description = "Alert events retrieved successfully")
    public ResponseEntity<ApiResponseDto<List<AlertEventResponseDto>>> getEvents(
            @Parameter(description = "Search keyword (Device, Rule, Event ID)") @RequestParam(required = false) String search,
            @Parameter(description = "Component Type (All, Alerts, Alarms, Tickets)") @RequestParam(required = false, defaultValue = "All") String type,
            @Parameter(description = "Severity (All, Critical, Warning, Info, Low)") @RequestParam(required = false, defaultValue = "All") String severity,
            @Parameter(description = "Time Range (All, Last 1 hour, Last 24 hours, Last 7 days)") @RequestParam(required = false, defaultValue = "All") String timeRange
    ) {
        List<AlertEventResponseDto> list = alertService.getFilteredEvents(search, type, severity, timeRange);
        return ResponseEntity.ok(
                ApiResponseDto.<List<AlertEventResponseDto>>builder()
                        .success(true)
                        .message("Alert events retrieved successfully.")
                        .data(list)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 3. Acknowledge Alert Event ("Ack" Button)
    // --------------------------------------------------------------------------
    @PatchMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge Alert Event", description = "Changes event lifecycle status to ACKNOWLEDGED by the logged-in engineer.")
    @ApiResponse(responseCode = "200", description = "Event acknowledged successfully")
    @ApiResponse(responseCode = "404", description = "Alert event not found")
    public ResponseEntity<ApiResponseDto<Void>> acknowledgeEvent(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : "System Engineer";
        alertService.acknowledgeEvent(id, userEmail);
        return ResponseEntity.ok(
                ApiResponseDto.<Void>builder()
                        .success(true)
                        .message("Event has been successfully acknowledged.")
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 4. Resolve Alert Event ("Resolve" Button)
    // --------------------------------------------------------------------------
    @PatchMapping("/{id}/resolve")
    @Operation(summary = "Resolve Alert Event", description = "Marks an alert event as RESOLVED.")
    @ApiResponse(responseCode = "200", description = "Event resolved successfully")
    @ApiResponse(responseCode = "404", description = "Alert event not found")
    public ResponseEntity<ApiResponseDto<Void>> resolveEvent(@PathVariable UUID id) {
        alertService.resolveEvent(id);
        return ResponseEntity.ok(
                ApiResponseDto.<Void>builder()
                        .success(true)
                        .message("Event has been resolved successfully.")
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 5. Create Rule (Alert Engine Rule Builder Modal)
    // --------------------------------------------------------------------------
    @PostMapping("/rules")
    @Operation(summary = "Create Alert Escalation Rule", description = "Creates a new multi-stage trigger, escalation, and ticket dispatch rule.")
    @ApiResponse(responseCode = "201", description = "Rule created and activated successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed for rule parameters")
    public ResponseEntity<ApiResponseDto<AlertRuleResponseDto>> createRule(@Valid @RequestBody CreateAlertRuleRequestDto request) {
        AlertRuleResponseDto created = alertService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponseDto.<AlertRuleResponseDto>builder()
                        .success(true)
                        .message("Rule \"" + request.getRuleName() + "\" published and synced successfully.")
                        .data(created)
                        .build()
        );
    }

    // --------------------------------------------------------------------------
    // 6. Get All Active Rules
    // --------------------------------------------------------------------------
    @GetMapping("/rules")
    @Operation(summary = "List Active Alert Rules", description = "Retrieves all configured automation and escalation rules.")
    @ApiResponse(responseCode = "200", description = "Rules retrieved successfully")
    public ResponseEntity<ApiResponseDto<List<AlertRuleResponseDto>>> getAllRules() {
        List<AlertRuleResponseDto> rules = alertService.getAllRules();
        return ResponseEntity.ok(
                ApiResponseDto.<List<AlertRuleResponseDto>>builder()
                        .success(true)
                        .message("Active rules retrieved successfully.")
                        .data(rules)
                        .build()
        );
    }
}