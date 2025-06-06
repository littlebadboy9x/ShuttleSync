package com.example.shuttlesync.service;

import com.example.shuttlesync.model.SystemChangeLog;

import java.time.LocalDateTime;
import java.util.List;

public interface SystemChangeLogService {
    
    List<SystemChangeLog> getAllLogs();
    
    List<SystemChangeLog> getLogsByTableAndRecordId(String tableName, Integer recordId);
    
    List<SystemChangeLog> getLogsByUserId(Integer userId);
    
    List<SystemChangeLog> getLogsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    
    SystemChangeLog createLog(String tableName, Integer recordId, String changeType, String changedFields, Integer changedById);
} 