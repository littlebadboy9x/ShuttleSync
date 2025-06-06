package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Code", unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "Description")
    private String description;

    @Column(name = "DiscountPercent")
    private Integer discountPercent;

    @Column(name = "ValidFrom")
    private LocalDate validFrom;

    @Column(name = "ValidTo")
    private LocalDate validTo;
} 