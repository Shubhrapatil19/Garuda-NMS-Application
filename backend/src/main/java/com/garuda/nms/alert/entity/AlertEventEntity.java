package com.garuda.nms.alert.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity mapping directly to PostgreSQL 'alert_events' table.
 */
@Entity
@Table(name = "alert_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "event_code", nullable = false, unique = true, length = 30)
    private String eventCode;

    @Column(name = "device_id")
    private UUID deviceId;

    @Column(name = "device_name", nullable = false, length = 150)
    private String deviceName;

    @Column(name = "event_type", nullable = false, length = 20)
    private String eventType; // 'Alert', 'Alarm', 'Ticket'

    @Column(nullable = false, length = 20)
    private String severity;   // 'Critical', 'Warning', 'Info', 'Low'

    @Column(name = "rule_source", nullable = false, length = 255)
    private String ruleSource;

    @Column(name = "impacted_entity", length = 150)
    private String impactedEntity;

    @Column(name = "event_count")
    private Integer eventCount;

    @Column(nullable = false, length = 30)
    private String status;     // 'OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'

    @Column(name = "acknowledged_by", length = 150)
    private String acknowledgedBy;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}