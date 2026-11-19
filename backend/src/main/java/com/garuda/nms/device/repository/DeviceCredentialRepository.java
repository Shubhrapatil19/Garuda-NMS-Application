package com.garuda.nms.device.repository;

import com.garuda.nms.device.entity.DeviceCredentialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceCredentialRepository extends JpaRepository<DeviceCredentialEntity, UUID> {

    @Query(value = "SELECT * FROM device_credentials WHERE device_id = :deviceId", nativeQuery = true)
    Optional<DeviceCredentialEntity> findByDeviceIdNative(@Param("deviceId") UUID deviceId);

    @Modifying
    @Query(value = """
        INSERT INTO device_credentials (id, device_id, management_ip, management_port, protocol, username, auth_method, credential_encrypted, created_at, updated_at)
        VALUES (gen_random_uuid(), :deviceId, :mgmtIp, :port, :protocol, :username, :authMethod, :credential, NOW(), NOW())
    """, nativeQuery = true)
    void insertCredentialNative(
            @Param("deviceId") UUID deviceId,
            @Param("mgmtIp") String mgmtIp,
            @Param("port") Integer port,
            @Param("protocol") String protocol,
            @Param("username") String username,
            @Param("authMethod") String authMethod,
            @Param("credential") String credential
    );
}