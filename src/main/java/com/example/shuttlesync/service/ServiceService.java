package com.example.shuttlesync.service;

import com.example.shuttlesync.dto.ServiceDTO;
import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.model.ServiceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ServiceService {
    // Service methods
    List<Service> getAllServices();
    
    Optional<Service> getServiceById(Integer id);
    
    List<Service> getServicesByType(Integer typeId);
    
    List<Service> getActiveServices();
    
    List<Service> searchServices(String keyword);
    
    Page<Service> searchServices(String keyword, Pageable pageable);
    
    Service createService(ServiceDTO serviceDTO);
    
    Service updateService(Integer id, ServiceDTO serviceDTO);
    
    Service updateServiceStatus(Integer id, Boolean isActive);
    
    Service updateServiceType(Integer id, Integer serviceTypeId);
    
    void deleteService(Integer id);
    
    List<Service> getServicesByPriceRange(BigDecimal minPrice, BigDecimal maxPrice);
    
    Map<String, Long> getServiceStatistics();

    // ServiceType methods
    List<ServiceType> getAllServiceTypes();
    
    Optional<ServiceType> getServiceTypeById(Integer id);
    
    ServiceType createServiceType(String name, String description);
    
    ServiceType updateServiceType(Integer id, String name, String description);
    
    void deleteServiceType(Integer id);
    
    List<ServiceType> searchServiceTypes(String keyword);
    
    List<ServiceType> getActiveServiceTypes();
    
    Map<Integer, Long> countServicesByType();
} 