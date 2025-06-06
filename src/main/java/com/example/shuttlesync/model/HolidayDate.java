package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "HolidayDates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "HolidayDate", nullable = false)
    private LocalDate date;
    
    @Column(name = "HolidayName", nullable = false)
    private String holidayName;
    
    @Column(name = "Description")
    private String description;
    
    @Column(name = "IsRecurringYearly")
    private Boolean isRecurringYearly = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy")
    private User createdBy;
    
    @PrePersist
    protected void onCreate() {
        if (createdBy == null) {
            // Đặt giá trị mặc định nếu cần
        }
    }
} 