package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.SystemChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemChangeLogRepository extends JpaRepository<SystemChangeLog, Integer> {
    
    List<SystemChangeLog> findByTableNameAndRecordId(String tableName, Integer recordId);
    
    List<SystemChangeLog> findByChangedByIdOrderByChangedAtDesc(Integer userId);
    
    List<SystemChangeLog> findByChangedAtBetweenOrderByChangedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
} 