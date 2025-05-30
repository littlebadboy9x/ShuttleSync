package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotRequest {
    private Integer slotIndex;
    private LocalTime startTime;
    private LocalTime endTime;
}
