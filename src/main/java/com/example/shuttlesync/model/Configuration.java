package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "Configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Configuration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ConfigKey", nullable = false, length = 50, unique = true)
    private String configKey;

    @Column(name = "ConfigValue", nullable = false, length = 255)
    private String configValue;

    @Column(name = "Description", length = 255)
    private String description;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "UpdatedBy")
    private User updatedBy;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 