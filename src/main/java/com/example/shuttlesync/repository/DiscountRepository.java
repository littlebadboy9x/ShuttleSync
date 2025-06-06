package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Integer> {

    // Find by code (for voucher lookup)
    Optional<Discount> findByCode(String code);

    // Check if code exists (for unique validation)
    boolean existsByCode(String code);

    // Find by status
    List<Discount> findByStatus(Discount.DiscountStatus status);

    // Find by type
    List<Discount> findByType(Discount.DiscountType type);

    // Find active vouchers
    @Query("SELECT d FROM Discount d WHERE d.status = 'ACTIVE' AND d.validFrom <= :currentDate AND (d.validTo IS NULL OR d.validTo >= :currentDate)")
    List<Discount> findActiveVouchers(@Param("currentDate") LocalDate currentDate);

    // Find expired vouchers
    @Query("SELECT d FROM Discount d WHERE d.status = 'ACTIVE' AND d.validTo IS NOT NULL AND d.validTo < :currentDate")
    List<Discount> findExpiredVouchers(@Param("currentDate") LocalDate currentDate);

    // Find vouchers expiring soon
    @Query("SELECT d FROM Discount d WHERE d.status = 'ACTIVE' AND d.validTo IS NOT NULL AND d.validTo BETWEEN :startDate AND :endDate")
    List<Discount> findVouchersExpiringSoon(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find vouchers by date range
    @Query("SELECT d FROM Discount d WHERE d.validFrom <= :endDate AND (d.validTo IS NULL OR d.validTo >= :startDate)")
    List<Discount> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find available vouchers for a specific amount
    @Query("SELECT d FROM Discount d WHERE d.status = 'ACTIVE' AND d.validFrom <= :currentDate AND (d.validTo IS NULL OR d.validTo >= :currentDate) AND (d.minOrderAmount IS NULL OR d.minOrderAmount <= :orderAmount) AND (d.usageLimit IS NULL OR d.usedCount < d.usageLimit)")
    List<Discount> findAvailableVouchersForAmount(@Param("currentDate") LocalDate currentDate, @Param("orderAmount") java.math.BigDecimal orderAmount);

    // Find vouchers by search term (code, name, description)
    @Query("SELECT d FROM Discount d WHERE LOWER(d.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(d.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Discount> findBySearchTerm(@Param("searchTerm") String searchTerm);

    // Count by status
    long countByStatus(Discount.DiscountStatus status);

    // Get usage statistics
    @Query("SELECT SUM(d.usedCount) FROM Discount d")
    Long getTotalUsageCount();

    @Query("SELECT AVG(CAST(d.usedCount AS double) / CAST(d.usageLimit AS double)) FROM Discount d WHERE d.usageLimit > 0")
    Double getAverageUsageRate();
} 