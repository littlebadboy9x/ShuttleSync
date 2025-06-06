package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.ServiceDTO;
import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.service.ServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class AdminServiceController {

    private final ServiceService serviceService;

    @GetMapping("/services/active")
    public ResponseEntity<List<ServiceDTO>> getActiveServices() {
        try {
            log.info("Getting active services for admin - endpoint /admin/services/active called");
            
            // Thêm debug log
            log.debug("Calling serviceService.getActiveServices()");
            List<Service> services = serviceService.getActiveServices();
            log.debug("Found {} active services", services != null ? services.size() : 0);
            
            // Kiểm tra null và trả về danh sách trống nếu cần
            if (services == null) {
                log.warn("Active services list is null, returning empty list");
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            List<ServiceDTO> serviceDTOs = services.stream()
                    .map(service -> {
                        try {
                            return new ServiceDTO(service);
                        } catch (Exception e) {
                            log.error("Error mapping service to DTO: {}", e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            log.info("Successfully mapped {} services to DTOs", serviceDTOs.size());
            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            log.error("Error getting active services for admin: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>()); // Trả về danh sách trống thay vì lỗi 500
        }
    }
} 