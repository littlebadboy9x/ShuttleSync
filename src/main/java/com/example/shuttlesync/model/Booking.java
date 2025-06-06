package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "UserId", nullable = false)
    @ToString.Exclude
    private User user;

    @ManyToOne
    @JoinColumn(name = "CourtId", nullable = false)
    @ToString.Exclude
    private Court court;
    
    @Column(name = "BookingDate", nullable = false)
    private LocalDate bookingDate;
    
    @ManyToOne
    @JoinColumn(name = "TimeSlotId", nullable = false)
    @ToString.Exclude
    private TimeSlot timeSlot;
    
    @ManyToOne
    @JoinColumn(name = "Status", nullable = false)
    @ToString.Exclude
    private BookingStatusType status;
    
    @Column(name = "Notes", length = 255)
    private String notes;
    
    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<Payment> payments = new HashSet<>();
    
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<Review> reviews = new HashSet<>();
    
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private CustomerBookingInfo customerBookingInfo;

    @ManyToMany
    @JoinTable(
        name = "BookingDiscounts",
        joinColumns = @JoinColumn(name = "BookingId"),
        inverseJoinColumns = @JoinColumn(name = "DiscountId")
    )
    @ToString.Exclude
    private Set<Discount> discounts = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}