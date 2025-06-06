package com.example.shuttlesync.dto;

import com.example.shuttlesync.model.Service;
import com.example.shuttlesync.model.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDTO {
    private Integer id;
    private Integer serviceTypeId;
    private String serviceTypeName;
    private String serviceName;
    private String description;
    private BigDecimal unitPrice;
    private Boolean isActive;
    
    // Constructor từ entity Service
    public ServiceDTO(Service service) {
        this.id = service.getId();
        this.serviceName = service.getServiceName();
        this.description = service.getDescription();
        this.unitPrice = service.getUnitPrice();
        this.isActive = service.getIsActive();
        
        if (service.getServiceType() != null) {
            this.serviceTypeId = service.getServiceType().getId();
            this.serviceTypeName = service.getServiceType().getTypeName();
        }
    }
    
    // Phương thức để chuyển đổi từ DTO sang entity
    public Service toEntity() {
        Service service = new Service();
        service.setId(this.id);
        service.setServiceName(this.serviceName);
        service.setDescription(this.description);
        service.setUnitPrice(this.unitPrice);
        service.setIsActive(this.isActive != null ? this.isActive : true);
        return service;
    }
    
    // Phương thức để chuyển đổi từ DTO sang entity với ServiceType
    public Service toEntity(ServiceType serviceType) {
        Service service = toEntity();
        service.setServiceType(serviceType);
        return service;
    }
}

