package com.garuda.nms.device.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Stores administrative credentials and transport layer connection configurations.
 */
@Entity
@Table(name = "device_credentials")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceCredentialEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "device_id", nullable = false, unique = true)
    private UUID deviceId;

    @Column(name = "management_ip", nullable = false, length = 45)
    private String managementIp;

    @Column(name = "management_port", nullable = false)
    private Integer managementPort;

    @Column(nullable = false, length = 30)
    private String protocol;

    @Column(length = 100)
    private String username;

    @Column(name = "auth_method", length = 50)
    private String authMethod;

    @Column(name = "credential_encrypted", nullable = false, columnDefinition = "TEXT")
    private String credentialEncrypted;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}