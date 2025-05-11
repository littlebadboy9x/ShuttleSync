package com.example.shuttlesync.repository;

import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.StatusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourtRepository extends JpaRepository<Court, Integer> {

    List<Court> findByStatus(StatusType status);

    @Query("SELECT c FROM Court c WHERE c.hasFixedTimeSlots = true")
    List<Court> findCourtsWithFixedTimeSlots();

    @Query("SELECT c FROM Court c WHERE c.hasFixedTimeSlots = false")
    List<Court> findCourtsWithoutFixedTimeSlots();

    List<Court> findCourtsByName(String name);
}