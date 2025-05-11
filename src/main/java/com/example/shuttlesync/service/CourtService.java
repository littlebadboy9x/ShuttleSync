package com.example.shuttlesync.service;

import com.example.shuttlesync.model.Court;

import java.util.List;

public interface CourtService {

    List<Court> getAllCourts();

    Court getCourtById(Integer id);

    List<Court> getAvailableCourts();

    Court createCourt(Court court);

    Court updateCourt(Integer id, Court court);

    void deleteCourt(Integer id);

    List<Court> getCourtsWithFixedTimeSlots();

    List<Court> getCourtsWithoutFixedTimeSlots();
}
