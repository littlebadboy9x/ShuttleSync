package com.example.shuttlesync.controller;

import com.example.shuttlesync.model.Configuration;
import com.example.shuttlesync.model.User;
import com.example.shuttlesync.service.ConfigurationService;
import com.example.shuttlesync.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin/config")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class ConfigurationController {

    private final ConfigurationService configurationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Configuration>> getAllConfigurations() {
        log.info("Fetching all configurations");
        return ResponseEntity.ok(configurationService.getAllConfigurations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Configuration> getConfigurationById(@PathVariable Integer id) {
        log.info("Fetching configuration with id: {}", id);
        return configurationService.getConfigurationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/key/{key}")
    public ResponseEntity<Configuration> getConfigurationByKey(@PathVariable String key) {
        log.info("Fetching configuration with key: {}", key);
        return configurationService.getConfigurationByKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/value/{key}")
    public ResponseEntity<Map<String, String>> getConfigurationValue(@PathVariable String key) {
        log.info("Fetching configuration value for key: {}", key);
        try {
            String value = configurationService.getValueByKey(key);
            Map<String, String> response = new HashMap<>();
            response.put("key", key);
            response.put("value", value);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching configuration value for key: {}", key, e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Configuration> createConfiguration(
            @RequestParam String key,
            @RequestParam String value,
            @RequestParam(required = false) String description) {
        log.info("Creating new configuration with key: {}", key);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            Configuration newConfig = configurationService.createConfiguration(key, value, description, currentUser);
            return ResponseEntity.ok(newConfig);
        } catch (Exception e) {
            log.error("Error creating configuration with key: {}", key, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Configuration> updateConfiguration(
            @PathVariable Integer id,
            @RequestParam String value,
            @RequestParam(required = false) String description) {
        log.info("Updating configuration with id: {}", id);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            Configuration updatedConfig = configurationService.updateConfiguration(id, value, description, currentUser);
            return ResponseEntity.ok(updatedConfig);
        } catch (Exception e) {
            log.error("Error updating configuration with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/key/{key}")
    public ResponseEntity<Configuration> updateConfigurationByKey(
            @PathVariable String key,
            @RequestParam String value,
            @RequestParam(required = false) String description) {
        log.info("Updating configuration with key: {}", key);
        
        // Lấy thông tin người dùng hiện tại
        User currentUser = getCurrentUser();
        
        try {
            Configuration updatedConfig = configurationService.updateConfigurationByKey(key, value, description, currentUser);
            return ResponseEntity.ok(updatedConfig);
        } catch (Exception e) {
            log.error("Error updating configuration with key: {}", key, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable Integer id) {
        log.info("Deleting configuration with id: {}", id);
        try {
            configurationService.deleteConfiguration(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting configuration with id: {}", id, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/key/{key}")
    public ResponseEntity<Void> deleteConfigurationByKey(@PathVariable String key) {
        log.info("Deleting configuration with key: {}", key);
        try {
            configurationService.deleteConfigurationByKey(key);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting configuration with key: {}", key, e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
} 