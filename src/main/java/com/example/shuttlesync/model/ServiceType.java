package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ServiceTypes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "TypeName", nullable = false, length = 100)
    private String typeName;

    @Column(name = "Description", length = 255)
    private String description;

    @OneToMany(mappedBy = "serviceType")
    private Set<Service> services = new HashSet<>();
} 