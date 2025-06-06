package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Integer> {

    @Query("SELECT s FROM Service s WHERE s.serviceType.id = :typeId")
    List<Service> findByServiceTypeId(@Param("typeId") Integer typeId);

    List<Service> findByIsActive(Boolean isActive);

    @Query("SELECT s FROM Service s WHERE s.serviceType.id = :typeId AND s.isActive = :active")
    List<Service> findByServiceTypeIdAndIsActive(@Param("typeId") Integer typeId, @Param("active") Boolean active);

    @Query("SELECT s FROM Service s WHERE LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Service> searchServices(@Param("keyword") String keyword);

    @Query("SELECT s FROM Service s WHERE LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Service> searchServices(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.serviceType.id = :typeId AND s.unitPrice BETWEEN :minPrice AND :maxPrice")
    List<Service> findByTypeAndPriceRange(@Param("typeId") Integer typeId,
                                        @Param("minPrice") BigDecimal minPrice,
                                        @Param("maxPrice") BigDecimal maxPrice);

    Optional<Service> findByServiceNameIgnoreCase(String serviceName);

    @Query("SELECT COUNT(s) FROM Service s WHERE s.isActive = :active")
    long countByIsActive(@Param("active") Boolean active);

}
