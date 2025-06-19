package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @OneToOne
    @JoinColumn(name = "BookingId", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "InvoiceDate", nullable = false)
    private LocalDate invoiceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "InvoiceType", length = 20, nullable = false)
    private InvoiceType invoiceType = InvoiceType.STANDARD;

    @Column(name = "BookingChannel", length = 20)
    private String bookingChannel; // Copy từ booking để dễ query

    @Column(name = "CounterStaffId")
    private Integer counterStaffId; // Nhân viên tạo hóa đơn tại quầy

    @Column(name = "OriginalAmount", precision = 10, scale = 2)
    private BigDecimal originalAmount;

    @Column(name = "DiscountAmount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "FinalAmount", precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "Status", length = 50)
    private String status;

    @Column(name = "Notes", length = 255)
    private String notes;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<InvoiceDetail> invoiceDetails = new HashSet<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<Payment> payments = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        invoiceDate = LocalDate.now();
        
        // Tự động set invoiceType và bookingChannel từ booking
        if (booking != null) {
            this.bookingChannel = booking.getBookingChannel().name();
            this.counterStaffId = booking.getCounterStaffId();
            
            switch (booking.getBookingChannel()) {
                case COUNTER:
                    this.invoiceType = InvoiceType.COUNTER;
                    break;
                case PHONE:
                    this.invoiceType = InvoiceType.PHONE;
                    break;
                case MOBILE_APP:
                    this.invoiceType = InvoiceType.MOBILE_APP;
                    break;
                default:
                    this.invoiceType = InvoiceType.ONLINE;
            }
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Enum cho loại hóa đơn theo kênh đặt
    public enum InvoiceType {
        STANDARD("Hóa đơn tiêu chuẩn", "📄"),
        ONLINE("Hóa đơn đặt online", "🌐"),
        COUNTER("Hóa đơn đặt tại quầy", "🏢"),
        PHONE("Hóa đơn đặt qua điện thoại", "📞"),
        MOBILE_APP("Hóa đơn đặt qua app", "📱");

        private final String description;
        private final String icon;

        InvoiceType(String description, String icon) {
            this.description = description;
            this.icon = icon;
        }

        public String getDescription() {
            return description;
        }

        public String getIcon() {
            return icon;
        }

        public String getDisplayName() {
            return icon + " " + description;
        }
    }
} 