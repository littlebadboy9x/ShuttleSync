package com.example.shuttlesync.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardStatsDto {
    private int totalBookings;
    private int todayBookings;
    private int totalUsers;
    private BigDecimal totalRevenue;
} 