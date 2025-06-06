package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.PaymentStatusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentStatusTypeRepository extends JpaRepository<PaymentStatusType, Byte> {
} 