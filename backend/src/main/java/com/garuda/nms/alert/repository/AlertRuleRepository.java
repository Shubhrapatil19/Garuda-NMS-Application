package com.garuda.nms.alert.repository;

import com.garuda.nms.alert.entity.AlertRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRuleEntity, UUID> {

    @Query(value = "SELECT * FROM alert_rules WHERE is_active = true ORDER BY created_at DESC", nativeQuery = true)
    List<AlertRuleEntity> findAllActiveRulesNative();
}