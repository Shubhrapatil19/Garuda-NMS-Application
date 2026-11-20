package com.garuda.nms.alert.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

/**
 * KPI summary metrics for the top 4 dashboard cards.
 */
@Data
@Builder
@Schema(description = "Summary KPI metrics for Alert Engine")
public class AlertKpiResponseDto {

    @Schema(description = "Active Warning/Soft alerts count", example = "23")
    private Long activeAlerts;

    @Schema(description = "Critical Hard/Urgent alarms count", example = "5")
    private Long criticalAlarms;

    @Schema(description = "Open ITSM Linked tickets count", example = "8")
    private Long openTickets;

    @Schema(description = "Suppressed / flapping alerts count", example = "14")
    private Long suppressedCount;
}