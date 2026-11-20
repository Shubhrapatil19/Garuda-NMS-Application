package com.garuda.nms.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity mapped to the PostgreSQL 'organizations' table.
 */
@Entity
@Table(name = "organizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "org_name", nullable = false, unique = true, length = 150)
    private String orgName;

    @Column(name = "org_code", nullable = false, unique = true, length = 50)
    private String orgCode;

    @Column(name = "domain_name", unique = true, length = 100)
    private String domainName;

    @Column(name = "is_active")
    private boolean active;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}