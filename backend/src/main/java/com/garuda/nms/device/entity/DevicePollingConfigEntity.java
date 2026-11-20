package com.garuda.nms.device.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Stores SNMP, Syslog, RESTCONF, and streaming telemetry polling settings.
 */
@Entity
@Table(name = "device_polling_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevicePollingConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "device_id", nullable = false, unique = true)
    private UUID deviceId;

    @Column(name = "snmp_version", length = 10)
    private String snmpVersion;

    @Column(name = "snmp_community", length = 100)
    private String snmpCommunity;

    @Column(name = "snmp_context", length = 100)
    private String snmpContext;

    @Column(name = "polling_frequency_sec")
    private Integer pollingFrequencySec;

    @Column(name = "timeout_sec")
    private Integer timeoutSec;

    @Column(name = "retries")
    private Integer retries;

    @Column(name = "api_endpoint", length = 255)
    private String apiEndpoint;

    @Column(name = "api_auth_token", columnDefinition = "TEXT")
    private String apiAuthToken;

    @Column(name = "syslog_facility", length = 30)
    private String syslogFacility;

    @Column(name = "syslog_port")
    private Integer syslogPort;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}