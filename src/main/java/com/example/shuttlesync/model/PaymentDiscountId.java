package com.example.shuttlesync.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDiscountId implements Serializable {
    private Integer paymentId;
    private Integer discountId;
} 