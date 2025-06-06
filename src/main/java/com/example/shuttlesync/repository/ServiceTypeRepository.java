package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, Integer> {
    
    @Query("SELECT st FROM ServiceType st WHERE st.typeName LIKE %:keyword% OR st.description LIKE %:keyword%")
    List<ServiceType> searchServiceTypes(@Param("keyword") String keyword);
    
    Optional<ServiceType> findByTypeNameIgnoreCase(String typeName);
    
    @Query("SELECT DISTINCT st FROM ServiceType st JOIN st.services s WHERE s.isActive = true")
    List<ServiceType> findTypesWithActiveServices();
    
    @Query("SELECT st FROM ServiceType st WHERE st.services IS EMPTY")
    List<ServiceType> findEmptyTypes();
    
    @Query("SELECT st.id, COUNT(s) FROM ServiceType st LEFT JOIN st.services s GROUP BY st.id")
    List<Object[]> countServicesByType();
} 