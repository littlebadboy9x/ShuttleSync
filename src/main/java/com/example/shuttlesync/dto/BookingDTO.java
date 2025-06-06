package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Integer id;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String courtName;
    private String courtLocation;
    private LocalDate bookingDate;
    private String startTime;
    private String endTime;
    private String status;
    private Double totalAmount;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private String notes;

    @Override
    public String toString() {
        return "BookingDTO{" +
                "id=" + id +
                ", userName='" + userName + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", courtName='" + courtName + '\'' +
                ", bookingDate=" + bookingDate +
                ", startTime='" + startTime + '\'' +
                ", endTime='" + endTime + '\'' +
                ", status='" + status + '\'' +
                ", totalAmount=" + totalAmount +
                ", paymentStatus='" + paymentStatus + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
} 
