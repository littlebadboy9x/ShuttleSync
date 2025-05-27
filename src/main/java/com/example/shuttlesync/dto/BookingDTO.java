package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Integer id;
    private String userName;
    private String courtName;
    private LocalDate bookingDate;
    private String startTime;
    private String endTime;
    private String status;

    @Override
    public String toString() {
        return "BookingDTO{" +
                "id=" + id +
                ", userName='" + userName + '\'' +
                ", courtName='" + courtName + '\'' +
                ", bookingDate=" + bookingDate +
                ", startTime='" + startTime + '\'' +
                ", endTime='" + endTime + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
} 
