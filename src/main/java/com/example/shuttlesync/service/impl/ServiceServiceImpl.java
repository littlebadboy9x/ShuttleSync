package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.dto.ServiceDTO;
import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.model.ServiceType;
import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.repository.ServiceRepository;
import com.example.shuttlesync.repository.ServiceTypeRepository;
import com.example.shuttlesync.service.ServiceService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ServiceServiceImpl implements ServiceService {
    private final ServiceRepository serviceRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    // --- Service methods ---
    @Override
    public Optional<Service> getServiceById(Integer id) {
        return serviceRepository.findById(id);
    }

    @Override
    public List<Service> getAllServices() {
        List<Service> services = serviceRepository.findAll();
        log.info("Retrieved {} services from database", services.size());
        return services;
    }

    @Override
    public List<Service> getServicesByType(Integer typeId) {
        if (!serviceTypeRepository.existsById(typeId)) {
            throw new ResourceNotFoundException("Không tìm thấy loại dịch vụ với ID: " + typeId);
        }
        return serviceRepository.findByServiceTypeId(typeId);
    }

    @Override
    public List<Service> getActiveServices() {
        return serviceRepository.findByIsActive(Boolean.TRUE);
    }
    
    @Override
    public List<Service> searchServices(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllServices();
        }
        return serviceRepository.searchServices(keyword.trim());
    }
    
    @Override
    public Page<Service> searchServices(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return serviceRepository.findAll(pageable);
        }
        return serviceRepository.searchServices(keyword.trim(), pageable);
    }

    @Override
    public Service createService(ServiceDTO serviceDTO) {
        validateServiceDTO(serviceDTO);
        
        Service service = serviceDTO.toEntity();
        
        // Xử lý serviceType
        if (serviceDTO.getServiceTypeId() != null && serviceDTO.getServiceTypeId() > 0) {
            ServiceType serviceType = serviceTypeRepository.findById(serviceDTO.getServiceTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy loại dịch vụ với ID: " + serviceDTO.getServiceTypeId()));
            service.setServiceType(serviceType);
        } else {
            service.setServiceType(null);
        }
        
        log.info("Creating new service: {}", service.getServiceName());
        return serviceRepository.save(service);
    }

    @Override
    public Service updateService(Integer id, ServiceDTO serviceDTO) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id));

        if (serviceDTO.getServiceName() != null && !serviceDTO.getServiceName().trim().isEmpty()) {
            service.setServiceName(serviceDTO.getServiceName().trim());
        }

        if (serviceDTO.getDescription() != null) {
            service.setDescription(serviceDTO.getDescription().trim());
        }

        if (serviceDTO.getUnitPrice() != null && serviceDTO.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
            service.setUnitPrice(serviceDTO.getUnitPrice());
        }
        
        if (serviceDTO.getIsActive() != null) {
            service.setIsActive(serviceDTO.getIsActive());
        }
        
        // Cập nhật serviceType nếu có
        if (serviceDTO.getServiceTypeId() != null) {
            if (serviceDTO.getServiceTypeId() > 0) {
                ServiceType serviceType = serviceTypeRepository.findById(serviceDTO.getServiceTypeId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy loại dịch vụ với ID: " + serviceDTO.getServiceTypeId()));
                service.setServiceType(serviceType);
                log.info("Updated service {} with type: {}", service.getServiceName(), serviceType.getTypeName());
            } else {
                service.setServiceType(null);
                log.info("Removed service type from service: {}", service.getServiceName());
            }
        }

        return serviceRepository.save(service);
    }
    
    @Override
    public Service updateServiceType(Integer id, Integer serviceTypeId) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id));
        
        if (serviceTypeId != null && serviceTypeId > 0) {
            ServiceType serviceType = serviceTypeRepository.findById(serviceTypeId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy loại dịch vụ với ID: " + serviceTypeId));
            service.setServiceType(serviceType);
            log.info("Updated service {} with type: {}", service.getServiceName(), serviceType.getTypeName());
        } else {
            service.setServiceType(null);
            log.info("Removed service type from service: {}", service.getServiceName());
        }
        
        return serviceRepository.save(service);
    }

    @Override
    public Service updateServiceStatus(Integer id, Boolean isActive) {
        if (isActive == null) {
            throw new IllegalArgumentException("Trạng thái hoạt động không được null");
        }

        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id));

        service.setIsActive(isActive);
        log.info("Updated service {} status to: {}", service.getServiceName(), isActive);
        return serviceRepository.save(service);
    }

    @Override
    public void deleteService(Integer id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id);
        }
        serviceRepository.deleteById(id);
        log.info("Deleted service with ID: {}", id);
    }
    
    @Override
    public List<Service> getServicesByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        final BigDecimal min = minPrice != null ? minPrice : BigDecimal.ZERO;
        final BigDecimal max = maxPrice != null ? maxPrice : new BigDecimal("999999999.99");
        
        return serviceRepository.findAll().stream()
                .filter(service -> 
                    service.getUnitPrice().compareTo(min) >= 0 && 
                    service.getUnitPrice().compareTo(max) <= 0)
                .collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Long> getServiceStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", serviceRepository.count());
        stats.put("active", serviceRepository.countByIsActive(true));
        stats.put("inactive", serviceRepository.countByIsActive(false));
        return stats;
    }

    // --- ServiceType methods ---
    @Override
    public List<ServiceType> getAllServiceTypes() {
        return serviceTypeRepository.findAll();
    }

    @Override
    public Optional<ServiceType> getServiceTypeById(Integer id) {
        return serviceTypeRepository.findById(id);
    }
    
    @Override
    public List<ServiceType> searchServiceTypes(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllServiceTypes();
        }
        return serviceTypeRepository.searchServiceTypes(keyword.trim());
    }
    
    @Override
    public List<ServiceType> getActiveServiceTypes() {
        return serviceTypeRepository.findTypesWithActiveServices();
    }

    @Override
    public ServiceType createServiceType(String name, String description) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên loại dịch vụ không được để trống");
        }
        
        // Kiểm tra trùng tên
        Optional<ServiceType> existingType = serviceTypeRepository.findByTypeNameIgnoreCase(name.trim());
        if (existingType.isPresent()) {
            throw new IllegalArgumentException("Loại dịch vụ với tên '" + name + "' đã tồn tại");
        }
        
        ServiceType serviceType = new ServiceType();
        serviceType.setTypeName(name.trim());
        serviceType.setDescription(description != null ? description.trim() : null);
        log.info("Creating new service type: {}", name);
        return serviceTypeRepository.save(serviceType);
    }

    @Override
    public ServiceType updateServiceType(Integer id, String name, String description) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại dịch vụ với ID: " + id));

        if (name != null && !name.trim().isEmpty()) {
            // Kiểm tra trùng tên với loại dịch vụ khác
            Optional<ServiceType> existingType = serviceTypeRepository.findByTypeNameIgnoreCase(name.trim());
            if (existingType.isPresent() && !existingType.get().getId().equals(id)) {
                throw new IllegalArgumentException("Loại dịch vụ với tên '" + name + "' đã tồn tại");
            }
            
            serviceType.setTypeName(name.trim());
        }

        if (description != null) {
            serviceType.setDescription(description.trim());
        }
        
        log.info("Updated service type: {}", serviceType.getTypeName());
        return serviceTypeRepository.save(serviceType);
    }

    @Override
    public void deleteServiceType(Integer id) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại dịch vụ với ID: " + id));
        
        // Kiểm tra xem loại dịch vụ có đang được sử dụng không
        List<Service> services = serviceRepository.findByServiceTypeId(id);
        if (!services.isEmpty()) {
            throw new IllegalStateException(
                    "Không thể xóa loại dịch vụ này vì đang được sử dụng bởi " + services.size() + " dịch vụ");
        }
        
        serviceTypeRepository.deleteById(id);
        log.info("Deleted service type with ID: {}", id);
    }
    
    @Override
    public Map<Integer, Long> countServicesByType() {
        List<Object[]> results = serviceTypeRepository.countServicesByType();
        Map<Integer, Long> counts = new HashMap<>();
        
        for (Object[] result : results) {
            Integer typeId = (Integer) result[0];
            Long count = (Long) result[1];
            counts.put(typeId, count);
        }
        
        return counts;
    }
    
    // --- Helper methods ---
    private void validateServiceDTO(ServiceDTO serviceDTO) {
        if (serviceDTO.getServiceName() == null || serviceDTO.getServiceName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên dịch vụ không được để trống");
        }
        
        if (serviceDTO.getUnitPrice() == null || serviceDTO.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Đơn giá phải lớn hơn 0");
        }
    }
}


