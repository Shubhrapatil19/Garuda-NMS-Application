package com.garuda.nms.alert.repository;

import com.garuda.nms.alert.entity.AlertEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlertEventRepository extends JpaRepository<AlertEventEntity, UUID> {

    // 1. Dynamic filtering matching frontend search, typeFilter, severityFilter, and timeRange
    @Query(value = """
        SELECT * FROM alert_events 
        WHERE (:search IS NULL OR :search = '' 
               OR LOWER(event_code) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(device_name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(rule_source) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:type IS NULL OR :type = 'All' 
               OR (:type = 'Alerts' AND event_type = 'Alert')
               OR (:type = 'Alarms' AND event_type = 'Alarm')
               OR (:type = 'Tickets' AND event_type = 'Ticket'))
          AND (:severity IS NULL OR :severity = 'All' OR severity = :severity)
          AND (
               :timeRange = 'All'
               OR (:timeRange = 'Last 1 hour' AND created_at >= NOW() - INTERVAL '1 HOUR')
               OR (:timeRange = 'Last 24 hours' AND created_at >= NOW() - INTERVAL '24 HOURS')
               OR (:timeRange = 'Last 7 days' AND created_at >= NOW() - INTERVAL '7 DAYS')
          )
        ORDER BY created_at DESC
    """, nativeQuery = true)
    List<AlertEventEntity> findAllFilteredNative(
            @Param("search") String search,
            @Param("type") String type,
            @Param("severity") String severity,
            @Param("timeRange") String timeRange
    );

    // 2. Count Active Soft Alerts
    @Query(value = "SELECT COUNT(*) FROM alert_events WHERE event_type = 'Alert' AND status != 'RESOLVED'", nativeQuery = true)
    Long countActiveAlertsNative();

    // 3. Count Critical Alarms
    @Query(value = "SELECT COUNT(*) FROM alert_events WHERE severity = 'Critical' AND status != 'RESOLVED'", nativeQuery = true)
    Long countCriticalAlarmsNative();

    // 4. Count Open ITSM Tickets
    @Query(value = "SELECT COUNT(*) FROM alert_events WHERE event_type = 'Ticket' AND status != 'RESOLVED'", nativeQuery = true)
    Long countOpenTicketsNative();

    // 5. Acknowledge Action
    @Modifying
    @Query(value = """
        UPDATE alert_events 
        SET status = 'ACKNOWLEDGED', acknowledged_by = :userEmail, acknowledged_at = NOW(), updated_at = NOW() 
        WHERE id = :id
    """, nativeQuery = true)
    int acknowledgeEventNative(@Param("id") UUID id, @Param("userEmail") String userEmail);

    // 6. Resolve Action
    @Modifying
    @Query(value = """
        UPDATE alert_events 
        SET status = 'RESOLVED', resolved_at = NOW(), updated_at = NOW() 
        WHERE id = :id
    """, nativeQuery = true)
    int resolveEventNative(@Param("id") UUID id);

    // 7. Find by event_code
    @Query(value = "SELECT * FROM alert_events WHERE event_code = :code", nativeQuery = true)
    Optional<AlertEventEntity> findByEventCodeNative(@Param("code") String code);

    // 8. Count Suppressed Alerts dynamically from database
    @Query(value = "SELECT COUNT(*) FROM alert_events WHERE status = 'SUPPRESSED'", nativeQuery = true)
    Long countSuppressedAlertsNative();

}