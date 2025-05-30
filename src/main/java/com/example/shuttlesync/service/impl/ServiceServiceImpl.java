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
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


@org.springframework.stereotype.Service
@Transactional
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {
    private final ServiceRepository serviceRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    // --- Các method đã có của Service ---
    @Override
    public Optional<Service> getServiceById(Integer id) {
        return serviceRepository.findById(id);
    }

    @Override
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
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
    public Service createService(ServiceDTO request) {
        if (request.getServiceName() == null || request.getServiceName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên dịch vụ không được để trống");
        }
        if (request.getUnitPrice() == null || request.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Đơn giá phải lớn hơn 0");
        }

        ServiceType serviceType = serviceTypeRepository.findById(request.getServiceTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại dịch vụ với ID: " + request.getServiceTypeId()));

        Service service = new Service();
        service.setServiceType(serviceType);
        service.setServiceName(request.getServiceName().trim());
        service.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        service.setUnitPrice(request.getUnitPrice());
        service.setIsActive(true);

        return serviceRepository.save(service);
    }

    @Override
    public Service updateService(Integer id, ServiceDTO request) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id));

        if (request.getServiceName() != null && !request.getServiceName().trim().isEmpty()) {
            service.setServiceName(request.getServiceName().trim());
        }

        if (request.getDescription() != null) {
            service.setDescription(request.getDescription().trim());
        }

        if (request.getUnitPrice() != null && request.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
            service.setUnitPrice(request.getUnitPrice());
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
        return serviceRepository.save(service);
    }

    @Override
    public void deleteService(Integer id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + id);
        }
        serviceRepository.deleteById(id);
    }

    // --- Các method mới implement cho ServiceType ---
    @Override
    public List<ServiceType> getAllServiceTypes() {
        return serviceTypeRepository.findAll();
    }

    @Override
    public Optional<ServiceType> getServiceTypeById(Integer id) {
        return serviceTypeRepository.findById(id);
    }

    @Override
    public ServiceType createServiceType(String name, String description) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên loại dịch vụ không được để trống");
        }
        ServiceType serviceType = new ServiceType();
        serviceType.setTypeName(name.trim());
        serviceType.setDescription(description != null ? description.trim() : null);
        return serviceTypeRepository.save(serviceType);
    }

    @Override
    public ServiceType updateServiceType(Integer id, String name, String description) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại dịch vụ với ID: " + id));

        if (name != null && !name.trim().isEmpty()) {
            serviceType.setTypeName(name.trim());
        }

        if (description != null) {
            serviceType.setDescription(description.trim());
        }

        return serviceTypeRepository.save(serviceType);
    }

    @Override
    public void deleteServiceType(Integer id) {
        if (!serviceTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy loại dịch vụ với ID: " + id);
        }
        serviceTypeRepository.deleteById(id);
    }
}


