package com.garuda.nms.device.repository;

import com.garuda.nms.device.entity.DevicePollingConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DevicePollingConfigRepository extends JpaRepository<DevicePollingConfigEntity, UUID> {

    @Query(value = "SELECT * FROM device_polling_configs WHERE device_id = :deviceId", nativeQuery = true)
    Optional<DevicePollingConfigEntity> findByDeviceIdNative(@Param("deviceId") UUID deviceId);

    @Modifying
    @Query(value = """
        INSERT INTO device_polling_configs (id, device_id, snmp_version, snmp_community, snmp_context, polling_frequency_sec, timeout_sec, retries, api_endpoint, api_auth_token, syslog_facility, syslog_port, created_at, updated_at)
        VALUES (gen_random_uuid(), :deviceId, :version, :community, :context, :freq, :timeout, :retries, :apiEndpoint, :apiAuthToken, :facility, :port, NOW(), NOW())
    """, nativeQuery = true)
    void insertPollingConfigNative(
            @Param("deviceId") UUID deviceId,
            @Param("version") String version,
            @Param("community") String community,
            @Param("context") String context,
            @Param("freq") Integer freq,
            @Param("timeout") Integer timeout,
            @Param("retries") Integer retries,
            @Param("apiEndpoint") String apiEndpoint,
            @Param("apiAuthToken") String apiAuthToken,
            @Param("facility") String facility,
            @Param("port") Integer port
    );
}