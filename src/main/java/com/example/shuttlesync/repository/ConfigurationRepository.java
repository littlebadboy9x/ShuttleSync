package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfigurationRepository extends JpaRepository<Configuration, Integer> {
    
    Optional<Configuration> findByConfigKey(String configKey);
    
    boolean existsByConfigKey(String configKey);
} 