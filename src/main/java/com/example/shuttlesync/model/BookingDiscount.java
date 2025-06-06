package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "BookingDiscounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDiscount {

    @EmbeddedId
    private BookingDiscountId id;

    @ManyToOne
    @MapsId("bookingId")
    @JoinColumn(name = "BookingId")
    private Booking booking;

    @ManyToOne
    @MapsId("discountId")
    @JoinColumn(name = "DiscountId")
    private Discount discount;
} 