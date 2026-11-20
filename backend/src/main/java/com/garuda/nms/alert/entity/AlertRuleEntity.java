package com.garuda.nms.alert.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity mapping to PostgreSQL 'alert_rules' table.
 */
@Entity
@Table(name = "alert_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRuleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "rule_name", nullable = false, length = 200)
    private String ruleName;

    @Column(name = "metric_name", nullable = false, length = 100)
    private String metricName;

    @Column(name = "trigger_condition", nullable = false, columnDefinition = "TEXT")
    private String triggerCondition;

    @Column(name = "escalation_threshold", nullable = false, columnDefinition = "TEXT")
    private String escalationThreshold;

    @Column(name = "action_automation", nullable = false, columnDefinition = "TEXT")
    private String actionAutomation;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}