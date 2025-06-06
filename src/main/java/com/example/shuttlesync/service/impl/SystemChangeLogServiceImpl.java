package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.SystemChangeLog;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.SystemChangeLogRepository;
import com.example.shuttlesync.repository.UserRepository;
import com.example.shuttlesync.service.SystemChangeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemChangeLogServiceImpl implements SystemChangeLogService {
    
    private final SystemChangeLogRepository systemChangeLogRepository;
    private final UserRepository userRepository;
    
    @Override
    public List<SystemChangeLog> getAllLogs() {
        return systemChangeLogRepository.findAll();
    }
    
    @Override
    public List<SystemChangeLog> getLogsByTableAndRecordId(String tableName, Integer recordId) {
        return systemChangeLogRepository.findByTableNameAndRecordId(tableName, recordId);
    }
    
    @Override
    public List<SystemChangeLog> getLogsByUserId(Integer userId) {
        return systemChangeLogRepository.findByChangedByIdOrderByChangedAtDesc(userId);
    }
    
    @Override
    public List<SystemChangeLog> getLogsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return systemChangeLogRepository.findByChangedAtBetweenOrderByChangedAtDesc(startDate, endDate);
    }
    
    @Override
    public SystemChangeLog createLog(String tableName, Integer recordId, String changeType, String changedFields, Integer changedById) {
        User changedBy = userRepository.findById(changedById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SystemChangeLog log = new SystemChangeLog();
        log.setTableName(tableName);
        log.setRecordId(recordId);
        log.setChangeType(changeType);
        log.setChangedFields(changedFields);
        log.setChangedBy(changedBy);
        log.setChangedAt(LocalDateTime.now());
        
        return systemChangeLogRepository.save(log);
    }
} 