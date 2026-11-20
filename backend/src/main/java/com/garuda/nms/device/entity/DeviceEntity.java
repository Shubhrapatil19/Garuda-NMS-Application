package com.garuda.nms.device.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity representing the physical/virtual network hardware in inventory.
 */
@Entity
@Table(name = "devices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "device_name", nullable = false, length = 150)
    private String deviceName;

    @Column(nullable = false, length = 200)
    private String hostname;

    @Column(name = "ip_address", nullable = false, unique = true, length = 45)
    private String ipAddress;

    @Column(nullable = false, length = 50)
    private String oem;

    @Column(name = "device_type", nullable = false, length = 50)
    private String deviceType;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(length = 30)
    private String environment;

    @Column(length = 20)
    private String status;

    @Column(name = "polling_method", length = 30)
    private String pollingMethod;

    @Column(name = "health_percentage")
    private Integer healthPercentage;

    @Column(name = "last_polled_at")
    private Instant lastPolledAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}