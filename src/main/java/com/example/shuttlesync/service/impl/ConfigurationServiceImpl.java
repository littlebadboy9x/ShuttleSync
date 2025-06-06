package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.Configuration;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.repository.ConfigurationRepository;
import com.example.shuttlesync.service.ConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConfigurationServiceImpl implements ConfigurationService {

    private final ConfigurationRepository configurationRepository;

    @Override
    public List<Configuration> getAllConfigurations() {
        return configurationRepository.findAll();
    }

    @Override
    public Optional<Configuration> getConfigurationById(Integer id) {
        return configurationRepository.findById(id);
    }

    @Override
    public Optional<Configuration> getConfigurationByKey(String key) {
        return configurationRepository.findByConfigKey(key);
    }

    @Override
    public String getValueByKey(String key) {
        return configurationRepository.findByConfigKey(key)
                .map(Configuration::getConfigValue)
                .orElseThrow(() -> new RuntimeException("Configuration key not found: " + key));
    }

    @Override
    public String getValueByKeyOrDefault(String key, String defaultValue) {
        return configurationRepository.findByConfigKey(key)
                .map(Configuration::getConfigValue)
                .orElse(defaultValue);
    }

    @Override
    public boolean existsByKey(String key) {
        return configurationRepository.existsByConfigKey(key);
    }

    @Override
    public Configuration createConfiguration(String key, String value, String description, User updatedBy) {
        // Kiểm tra xem key đã tồn tại chưa
        if (configurationRepository.existsByConfigKey(key)) {
            throw new RuntimeException("Configuration key already exists: " + key);
        }

        Configuration configuration = new Configuration();
        configuration.setConfigKey(key);
        configuration.setConfigValue(value);
        configuration.setDescription(description);
        configuration.setCreatedAt(LocalDateTime.now());
        configuration.setUpdatedAt(LocalDateTime.now());
        configuration.setUpdatedBy(updatedBy);

        return configurationRepository.save(configuration);
    }

    @Override
    public Configuration updateConfiguration(Integer id, String value, String description, User updatedBy) {
        Configuration configuration = configurationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuration not found with id: " + id));

        configuration.setConfigValue(value);
        configuration.setDescription(description);
        configuration.setUpdatedAt(LocalDateTime.now());
        configuration.setUpdatedBy(updatedBy);

        return configurationRepository.save(configuration);
    }

    @Override
    public Configuration updateConfigurationByKey(String key, String value, String description, User updatedBy) {
        Configuration configuration = configurationRepository.findByConfigKey(key)
                .orElseThrow(() -> new RuntimeException("Configuration not found with key: " + key));

        configuration.setConfigValue(value);
        configuration.setDescription(description);
        configuration.setUpdatedAt(LocalDateTime.now());
        configuration.setUpdatedBy(updatedBy);

        return configurationRepository.save(configuration);
    }

    @Override
    public void deleteConfiguration(Integer id) {
        configurationRepository.deleteById(id);
    }

    @Override
    public void deleteConfigurationByKey(String key) {
        Configuration configuration = configurationRepository.findByConfigKey(key)
                .orElseThrow(() -> new RuntimeException("Configuration not found with key: " + key));
        configurationRepository.delete(configuration);
    }
} 