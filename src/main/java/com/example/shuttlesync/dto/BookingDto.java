package com.example.shuttlesync.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {

    @NotNull
    private Integer userId;

    @NotNull
    private Integer courtId;

    @NotNull
    private LocalDate bookingDate;

    @NotNull
    private Integer timeSlotId;
}