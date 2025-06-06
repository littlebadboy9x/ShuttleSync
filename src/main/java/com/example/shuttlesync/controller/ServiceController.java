package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.ServiceDTO;
import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.model.ServiceType;
import com.example.shuttlesync.service.ServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/service")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH})
@Slf4j
public class ServiceController {

    private final ServiceService serviceService;

    // --- Service endpoints ---
    
    @GetMapping("/services")
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        try {
            log.info("Getting all services");
            List<Service> services = serviceService.getAllServices();
            log.info("Found {} services", services.size());
            
            List<ServiceDTO> serviceDTOs = services.stream()
                    .map(ServiceDTO::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            log.error("Error getting all services: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Integer id) {
        return serviceService.getServiceById(id)
                .map(service -> ResponseEntity.ok(new ServiceDTO(service)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/services/type/{typeId}")
    public ResponseEntity<List<ServiceDTO>> getServicesByType(@PathVariable Integer typeId) {
        try {
            List<Service> services = serviceService.getServicesByType(typeId);
            List<ServiceDTO> serviceDTOs = services.stream()
                    .map(ServiceDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            log.error("Error getting services by type: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/services/active")
    public ResponseEntity<List<ServiceDTO>> getActiveServices() {
        List<Service> services = serviceService.getActiveServices();
        List<ServiceDTO> serviceDTOs = services.stream()
                .map(ServiceDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(serviceDTOs);
    }
    
    @GetMapping("/services/search")
    public ResponseEntity<List<ServiceDTO>> searchServices(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("serviceName").ascending());
            Page<Service> servicePage = serviceService.searchServices(keyword, pageable);
            
            List<ServiceDTO> serviceDTOs = servicePage.getContent().stream()
                    .map(ServiceDTO::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            log.error("Error searching services: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/services/price-range")
    public ResponseEntity<List<ServiceDTO>> getServicesByPriceRange(
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        
        try {
            List<Service> services = serviceService.getServicesByPriceRange(minPrice, maxPrice);
            List<ServiceDTO> serviceDTOs = services.stream()
                    .map(ServiceDTO::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            log.error("Error getting services by price range: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/services/stats")
    public ResponseEntity<Map<String, Long>> getServiceStatistics() {
        try {
            return ResponseEntity.ok(serviceService.getServiceStatistics());
        } catch (Exception e) {
            log.error("Error getting service statistics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceDTO> createService(@RequestBody ServiceDTO serviceDTO) {
        try {
            log.info("Creating service: {}", serviceDTO.getServiceName());
            Service createdService = serviceService.createService(serviceDTO);
            return new ResponseEntity<>(new ServiceDTO(createdService), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Invalid service data: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating service: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceDTO> updateService(
            @PathVariable Integer id,
            @RequestBody ServiceDTO serviceDTO) {
        try {
            log.info("Updating service with ID: {}", id);
            Service updatedService = serviceService.updateService(id, serviceDTO);
            return ResponseEntity.ok(new ServiceDTO(updatedService));
        } catch (Exception e) {
            log.error("Error updating service: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/services/{id}/status")
    public ResponseEntity<ServiceDTO> updateServiceStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> body) {
        try {
            log.info("Updating service status for ID: {}", id);
            Boolean isActive = body.get("isActive");
            
            if (isActive == null) {
                log.warn("isActive is null in request");
                return ResponseEntity.badRequest().build();
            }

            Service updatedService = serviceService.updateServiceStatus(id, isActive);
            return ResponseEntity.ok(new ServiceDTO(updatedService));
        } catch (Exception e) {
            log.error("Error updating service status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PatchMapping("/services/{id}/service-type")
    public ResponseEntity<ServiceDTO> updateServiceType(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        try {
            log.info("Updating service type for service ID: {}", id);
            Integer serviceTypeId = body.get("serviceTypeId");
            
            if (serviceTypeId == null) {
                log.warn("serviceTypeId is null in request");
                return ResponseEntity.badRequest().build();
            }
            
            Service updatedService = serviceService.updateServiceType(id, serviceTypeId);
            return ResponseEntity.ok(new ServiceDTO(updatedService));
        } catch (Exception e) {
            log.error("Error updating service type: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Map<String, String>> deleteService(@PathVariable Integer id) {
        try {
            log.info("Deleting service with ID: {}", id);
            serviceService.deleteService(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã xóa thành công dịch vụ với ID = " + id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting service: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Thêm endpoint mới cho admin để lấy dịch vụ đang hoạt động
    @GetMapping("/admin/services/active")
    public ResponseEntity<List<ServiceDTO>> getActiveServicesForAdmin() {
        try {
            log.info("Getting active services for admin");
            List<Service> services = serviceService.getActiveServices();
            List<ServiceDTO> serviceDTOs = services.stream()
                    .map(ServiceDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            log.error("Error getting active services for admin: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- ServiceType endpoints ---
    
    @GetMapping("/service-types")
    public ResponseEntity<List<ServiceType>> getAllServiceTypes() {
        try {
            log.info("Getting all service types");
            List<ServiceType> serviceTypes = serviceService.getAllServiceTypes();
            
            // Đảm bảo không trả về danh sách services để tránh vòng lặp JSON
            serviceTypes.forEach(type -> type.setServices(new ArrayList<>()));
            
            return ResponseEntity.ok(serviceTypes);
        } catch (Exception e) {
            log.error("Error getting all service types: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/service-types/active")
    public ResponseEntity<List<ServiceType>> getActiveServiceTypes() {
        try {
            List<ServiceType> serviceTypes = serviceService.getActiveServiceTypes();
            
            // Đảm bảo không trả về danh sách services để tránh vòng lặp JSON
            serviceTypes.forEach(type -> type.setServices(new ArrayList<>()));
            
            return ResponseEntity.ok(serviceTypes);
        } catch (Exception e) {
            log.error("Error getting active service types: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/service-types/{id}")
    public ResponseEntity<ServiceType> getServiceTypeById(@PathVariable Integer id) {
        return serviceService.getServiceTypeById(id)
                .map(serviceType -> {
                    // Đảm bảo không trả về danh sách services để tránh vòng lặp JSON
                    serviceType.setServices(new ArrayList<>());
                    return ResponseEntity.ok(serviceType);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/service-types/search")
    public ResponseEntity<List<ServiceType>> searchServiceTypes(@RequestParam String keyword) {
        try {
            List<ServiceType> serviceTypes = serviceService.searchServiceTypes(keyword);
            
            // Đảm bảo không trả về danh sách services để tránh vòng lặp JSON
            serviceTypes.forEach(type -> type.setServices(new ArrayList<>()));
            
            return ResponseEntity.ok(serviceTypes);
        } catch (Exception e) {
            log.error("Error searching service types: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/service-types/count")
    public ResponseEntity<Map<Integer, Long>> countServicesByType() {
        try {
            return ResponseEntity.ok(serviceService.countServicesByType());
        } catch (Exception e) {
            log.error("Error counting services by type: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/service-types")
    public ResponseEntity<ServiceType> createServiceType(
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        try {
            log.info("Creating service type: {}", name);
            ServiceType serviceType = serviceService.createServiceType(name, description);
            
            // Đảm bảo không trả về danh sách services để tránh vòng lặp JSON
            serviceType.setServices(new ArrayList<>());
            
            return new ResponseEntity<>(serviceType, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Invalid service type data: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating service type: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/service-types/{id}")
    public ResponseEntity<ServiceType> updateServiceType(
            @PathVariable Integer id,
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        try {
            log.info("Updating service type with ID: {}", id);
            ServiceType serviceType = serviceService.updateServiceType(id, name, description);
            
            // Đảm bảo không trả về danh sách services để tránh vòng lặp JSON
            serviceType.setServices(new ArrayList<>());
            
            return ResponseEntity.ok(serviceType);
        } catch (IllegalArgumentException e) {
            log.error("Invalid service type data: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error updating service type: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/service-types/{id}")
    public ResponseEntity<Map<String, String>> deleteServiceType(@PathVariable Integer id) {
        try {
            log.info("Deleting service type with ID: {}", id);
            serviceService.deleteServiceType(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã xóa thành công loại dịch vụ với ID = " + id);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Cannot delete service type: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            log.error("Error deleting service type: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}