package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "HolidayDates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "HolidayDate", nullable = false, unique = true)
    private LocalDate holidayDate;

    @Column(name = "HolidayName", nullable = false, length = 100)
    private String holidayName;

    @Column(name = "Description", length = 255)
    private String description;

    @Column(name = "IsRecurringYearly")
    private Boolean isRecurringYearly = false;

    @ManyToOne
    @JoinColumn(name = "CreatedBy")
    private User createdBy;
} 