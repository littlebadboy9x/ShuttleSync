package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "UserId", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "CourtId", nullable = false)
    private Court court;
    
    @Column(name = "BookingDate", nullable = false)
    private LocalDate bookingDate;
    
    @ManyToOne
    @JoinColumn(name = "TimeSlotId", nullable = false)
    private TimeSlot timeSlot;
    
    @ManyToOne
    @JoinColumn(name = "Status", nullable = false)
    private BookingStatusType status;
    
    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Payment> payments = new HashSet<>();
    
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Review> reviews = new HashSet<>();
    
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private CustomerBookingInfo customerBookingInfo;

    @ManyToMany
    @JoinTable(
        name = "BookingDiscounts",
        joinColumns = @JoinColumn(name = "BookingId"),
        inverseJoinColumns = @JoinColumn(name = "DiscountId")
    )
    private Set<Discount> discounts = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}