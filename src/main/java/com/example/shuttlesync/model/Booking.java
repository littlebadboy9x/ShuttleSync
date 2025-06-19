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

    @Enumerated(EnumType.STRING)
    @Column(name = "BookingChannel", length = 20, nullable = false)
    private BookingChannel bookingChannel = BookingChannel.ONLINE;

    @Enumerated(EnumType.STRING)
    @Column(name = "BookingType", length = 20)
    private BookingType bookingType = BookingType.ADVANCE;

    @Column(name = "CounterStaffId")
    private Integer counterStaffId; // ID nhân viên tạo booking tại quầy
    
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

    // Enum cho kênh đặt
    public enum BookingChannel {
        ONLINE("Đặt online"),
        COUNTER("Đặt tại quầy"),
        PHONE("Đặt qua điện thoại"),
        MOBILE_APP("Đặt qua app mobile");

        private final String description;

        BookingChannel(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Enum cho loại đặt
    public enum BookingType {
        ADVANCE("Đặt trước"),
        URGENT("Đặt gấp"),
        RECURRING("Đặt định kỳ"),
        WALK_IN("Khách vãng lai");

        private final String description;

        BookingType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}