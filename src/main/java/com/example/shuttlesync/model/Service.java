package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "Services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
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
} 