package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Integer> {
    
    Optional<SystemConfig> findByConfigKey(String configKey);
} 