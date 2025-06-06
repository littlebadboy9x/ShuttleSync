package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "SystemChangeLog")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemChangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "TableName", nullable = false, length = 50)
    private String tableName;

    @Column(name = "RecordId", nullable = false)
    private Integer recordId;

    @Column(name = "ChangeType", nullable = false, length = 20)
    private String changeType;  // 'INSERT', 'UPDATE', 'DELETE'

    @Column(name = "ChangedFields", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String changedFields;  // JSON format

    @ManyToOne
    @JoinColumn(name = "ChangedBy", nullable = false)
    private User changedBy;

    @Column(name = "ChangedAt")
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
} 