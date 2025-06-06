package com.example.shuttlesync.controller;

import com.example.shuttlesync.dto.ServiceDTO;
import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.model.ServiceType;
import com.example.shuttlesync.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/service")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    // Service endpoints
    @GetMapping("/services")
    public ResponseEntity<List<Service>> getAllServices() {
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Integer id) {
        return serviceService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/services/type/{typeId}")
    public ResponseEntity<List<Service>> getServicesByType(@PathVariable Integer typeId) {
        return ResponseEntity.ok(serviceService.getServicesByType(typeId));
    }

    @GetMapping("/services/active")
    public ResponseEntity<List<Service>> getActiveServices() {
        return ResponseEntity.ok(serviceService.getActiveServices());
    }

    @PostMapping("/services")
    public ResponseEntity<Service> createService(@RequestBody ServiceDTO request) {
        return new ResponseEntity<>(serviceService.createService(request), HttpStatus.CREATED);
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<Service> updateService(
            @PathVariable Integer id,
            @RequestBody ServiceDTO request) {
        return ResponseEntity.ok(serviceService.updateService(id, request));
    }

    @PatchMapping("/services/{id}/status")
    public ResponseEntity<Service> updateServiceStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("isActive");
        return ResponseEntity.ok(serviceService.updateServiceStatus(id, isActive));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Map<String, String>> deleteService(@PathVariable Integer id) {
        serviceService.deleteService(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa thành công id = " + id);
        return ResponseEntity.ok(response);
    }

    // ServiceType endpoints
    @GetMapping("/service-types/{id}")
    public ResponseEntity<ServiceType> getServiceTypeById(@PathVariable Integer id) {
        return serviceService.getServiceTypeById(id)
                .map(serviceType -> {
                    ServiceType copy = new ServiceType();
                    copy.setId(serviceType.getId());
                    copy.setTypeName(serviceType.getTypeName());
                    copy.setDescription(serviceType.getDescription());
                    copy.setServices(new HashSet<>()); // hoặc null để tránh lỗi
                    return ResponseEntity.ok(copy);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/service-types")
    public ResponseEntity<List<ServiceType>> getAllServiceTypes() {
        List<ServiceType> serviceTypes = serviceService.getAllServiceTypes();

        // Tạo bản sao list mới, đảm bảo collection không bị thay đổi song song
        List<ServiceType> safeList = new ArrayList<>();
        for (ServiceType st : serviceTypes) {
            ServiceType copy = new ServiceType();
            copy.setId(st.getId());
            copy.setTypeName(st.getTypeName());
            copy.setDescription(st.getDescription());
            // Set services thành null hoặc empty set để tránh vòng lặp
            copy.setServices(new HashSet<>());
            safeList.add(copy);
        }

        return ResponseEntity.ok(safeList);
    }
    @PostMapping("/service-types")
    public ResponseEntity<ServiceType> createServiceType(
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        return new ResponseEntity<>(serviceService.createServiceType(name, description), HttpStatus.CREATED);
    }

    @PutMapping("/service-types/{id}")
    public ResponseEntity<ServiceType> updateServiceType(
            @PathVariable Integer id,
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(serviceService.updateServiceType(id, name, description));
    }

    @DeleteMapping("/service-types/{id}")
    public ResponseEntity<Void> deleteServiceType(@PathVariable Integer id) {
        serviceService.deleteServiceType(id);
        return ResponseEntity.noContent().build();
    }
}