package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, Integer> {
    
    @Query("SELECT st FROM ServiceType st WHERE st.typeName LIKE %:keyword% OR st.description LIKE %:keyword%")
    List<ServiceType> searchServiceTypes(@Param("keyword") String keyword);
    
    @Query("SELECT st FROM ServiceType st WHERE EXISTS (SELECT s FROM Service s WHERE s.serviceType = st AND s.isActive = true)")
    List<ServiceType> findTypesWithActiveServices();
    
    @Query("SELECT st FROM ServiceType st WHERE NOT EXISTS (SELECT s FROM Service s WHERE s.serviceType = st)")
    List<ServiceType> findEmptyTypes();
} 