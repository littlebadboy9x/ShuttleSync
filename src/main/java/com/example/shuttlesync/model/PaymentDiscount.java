package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PaymentDiscounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDiscount {

    @EmbeddedId
    private PaymentDiscountId id;

    @ManyToOne
    @MapsId("paymentId")
    @JoinColumn(name = "PaymentId")
    private Payment payment;

    @ManyToOne
    @MapsId("discountId")
    @JoinColumn(name = "DiscountId")
    private Discount discount;
} 