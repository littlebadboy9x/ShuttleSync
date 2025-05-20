package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Configuration;
import com.example.shuttlesync.model.User;

import java.util.List;
import java.util.Optional;

public interface ConfigurationService {
    
    List<Configuration> getAllConfigurations();
    
    Optional<Configuration> getConfigurationById(Integer id);
    
    Optional<Configuration> getConfigurationByKey(String key);
    
    Configuration createConfiguration(String key, String value, String description, User updatedBy);
    
    Configuration updateConfiguration(Integer id, String value, String description, User updatedBy);
    
    Configuration updateConfigurationByKey(String key, String value, String description, User updatedBy);
    
    void deleteConfiguration(Integer id);
    
    void deleteConfigurationByKey(String key);
    
    String getValueByKey(String key);
    
    String getValueByKeyOrDefault(String key, String defaultValue);
    
    boolean existsByKey(String key);
} 