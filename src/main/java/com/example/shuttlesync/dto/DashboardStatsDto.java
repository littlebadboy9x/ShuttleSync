package com.example.shuttlesync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private Integer totalBookings;
    private Integer completedBookings;
    private Integer upcomingBookings;
    private Integer cancelledBookings;
    private Double totalSpent;
    private Double totalSaved;
    private Integer favoriteCourtId;
    private String favoriteCourtName;
    private Integer loyaltyPoints;
    private String membershipLevel;
    
    private Integer todayBookings;
    private Integer totalUsers;
    private Double totalRevenue;
} 