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
    
    Optional<Discount> findByCode(String code);
    
    @Query("SELECT d FROM Discount d WHERE d.validFrom <= :date AND d.validTo >= :date")
    List<Discount> findActiveDiscounts(@Param("date") LocalDate date);
} 