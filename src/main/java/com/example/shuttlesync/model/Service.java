package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "Services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "serviceType")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ServiceTypeId")
    private ServiceType serviceType;

    @Column(name = "ServiceName", nullable = false, length = 100)
    private String serviceName;

    @Column(name = "Description", length = 255)
    private String description;

    @Column(name = "UnitPrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "IsActive")
    private Boolean isActive = true;
    
    // Phương thức tiện ích để lấy tên loại dịch vụ (nếu có)
    @Transient
    public String getServiceTypeName() {
        return serviceType != null ? serviceType.getTypeName() : null;
    }
    
    // Phương thức tiện ích để lấy ID loại dịch vụ (nếu có)
    @Transient
    public Integer getServiceTypeId() {
        return serviceType != null ? serviceType.getId() : null;
    }
} 