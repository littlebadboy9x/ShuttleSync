package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Integer> {

    List<Service> findByServiceTypeId(Integer typeId);

    List<Service> findByIsActive(Boolean isActive);


    @Query("SELECT s FROM Service s WHERE s.serviceType.id = :typeId AND s.isActive = true")
    List<Service> findActiveByTypeId(@Param("typeId") Integer typeId);

    @Query("SELECT s FROM Service s WHERE s.serviceName LIKE %:keyword% OR s.description LIKE %:keyword%")
    List<Service> searchServices(@Param("keyword") String keyword);

    @Query("SELECT s FROM Service s WHERE s.serviceType.id = :typeId AND s.unitPrice BETWEEN :minPrice AND :maxPrice")
    List<Service> findByTypeAndPriceRange(@Param("typeId") Integer typeId,
                                        @Param("minPrice") BigDecimal minPrice,
                                        @Param("maxPrice") BigDecimal maxPrice);

}
