package com.garuda.nms.device.repository;

import com.garuda.nms.device.entity.DeviceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<DeviceEntity, UUID> {

    // 1. Check if IP address already registered in database
    @Query(value = "SELECT COUNT(*) > 0 FROM devices WHERE ip_address = :ip", nativeQuery = true)
    boolean existsByIpAddressNative(@Param("ip") String ip);

    // 2. Fetch all devices with multi-criteria dynamic filtering (Search, OEM, Type, Status, Polling, Location)
    @Query(value = """
        SELECT * FROM devices 
        WHERE (:search IS NULL OR :search = '' OR LOWER(device_name) LIKE LOWER(CONCAT('%', :search, '%')) 
               OR ip_address LIKE CONCAT('%', :search, '%') 
               OR LOWER(location) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:oem IS NULL OR :oem = 'All' OR oem = :oem)
          AND (:deviceType IS NULL OR :deviceType = 'All' OR device_type = :deviceType)
          AND (:status IS NULL OR :status = 'All' OR status = :status)
          AND (:pollingMethod IS NULL OR :pollingMethod = 'All' OR polling_method = :pollingMethod)
          AND (:location IS NULL OR :location = 'All' OR LOWER(location) LIKE LOWER(CONCAT('%', :location, '%')))
        ORDER BY created_at DESC
    """, nativeQuery = true)
    List<DeviceEntity> findAllFilteredNative(
            @Param("search") String search,
            @Param("oem") String oem,
            @Param("deviceType") String deviceType,
            @Param("status") String status,
            @Param("pollingMethod") String pollingMethod,
            @Param("location") String location
    );

    // 3. Find device by ID
    @Query(value = "SELECT * FROM devices WHERE id = :id", nativeQuery = true)
    Optional<DeviceEntity> findByIdNative(@Param("id") UUID id);

    // 4. Insert New Device
    @Modifying
    @Query(value = """
        INSERT INTO devices (id, organization_id, device_name, hostname, ip_address, oem, device_type, location, environment, status, polling_method, health_percentage, last_polled_at, created_at, updated_at)
        VALUES (:id, :orgId, :name, :hostname, :ip, :oem, :type, :location, :env, 'Online', :method, 100, NOW(), NOW(), NOW())
    """, nativeQuery = true)
    void insertDeviceNative(
            @Param("id") UUID id,
            @Param("orgId") UUID orgId,
            @Param("name") String name,
            @Param("hostname") String hostname,
            @Param("ip") String ip,
            @Param("oem") String oem,
            @Param("type") String type,
            @Param("location") String location,
            @Param("env") String env,
            @Param("method") String method
    );

    // 5. Update Existing Device
    @Modifying
    @Query(value = """
        UPDATE devices 
        SET device_name = :name, device_type = :type, location = :location, environment = :env, status = :status, polling_method = :method, updated_at = NOW()
        WHERE id = :id
    """, nativeQuery = true)
    void updateDeviceNative(
            @Param("id") UUID id,
            @Param("name") String name,
            @Param("type") String type,
            @Param("location") String location,
            @Param("env") String env,
            @Param("status") String status,
            @Param("method") String method
    );

    // 6. Delete / Decommission Device
    @Modifying
    @Query(value = "DELETE FROM devices WHERE id = :id", nativeQuery = true)
    void deleteDeviceNative(@Param("id") UUID id);
}