package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Discount;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DiscountService {
    
    List<Discount> getAllDiscounts();
    
    Optional<Discount> getDiscountById(Integer id);
    
    Optional<Discount> getDiscountByCode(String code);
    
    List<Discount> getActiveDiscounts(LocalDate date);
    
    Discount createDiscount(Discount discount);
    
    Discount updateDiscount(Discount discount);
    
    void deleteDiscount(Integer id);
} 