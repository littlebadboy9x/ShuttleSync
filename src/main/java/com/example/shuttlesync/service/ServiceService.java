package com.example.shuttlesync.service;

import com.example.shuttlesync.dto.ServiceDTO;
import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.model.ServiceType;

import java.util.List;
import java.util.Optional;

public interface ServiceService {
    
    List<Service> getAllServices();
    
    Optional<Service> getServiceById(Integer id);
    
    List<Service> getServicesByType(Integer typeId);
    
    List<Service> getActiveServices();
    
    Service createService(ServiceDTO request);

    Service updateService(Integer id, ServiceDTO request);
    
    Service updateServiceStatus(Integer id, Boolean isActive);
    
    void deleteService(Integer id);
    
    List<ServiceType> getAllServiceTypes();
    
    Optional<ServiceType> getServiceTypeById(Integer id);
    
    ServiceType createServiceType(String name, String description);
    
    ServiceType updateServiceType(Integer id, String name, String description);
    
    void deleteServiceType(Integer id);
} 