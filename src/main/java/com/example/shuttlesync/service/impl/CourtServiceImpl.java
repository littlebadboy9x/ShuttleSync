package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.exeption.ResourceNotFoundException;
import com.example.shuttlesync.model.Court;
import com.example.shuttlesync.model.StatusType;
import com.example.shuttlesync.repository.CourtRepository;
import com.example.shuttlesync.repository.StatusTypeRepository;
import com.example.shuttlesync.service.CourtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourtServiceImpl implements CourtService {

    private final CourtRepository courtRepository;
    private final StatusTypeRepository statusTypeRepository;

    @Override
    public List<Court> getAllCourts() {
        return courtRepository.findAll();
    }

    @Override
    public Court getCourtById(Integer id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found with ID: " + id));
    }

    @Override
    public List<Court> getAvailableCourts() {
        StatusType trongStatus = statusTypeRepository.findByName("Trống")
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
        
        return courtRepository.findByStatus(trongStatus);
    }

    @Override
    public Court createCourt(Court court) {
        return courtRepository.save(court);
    }

    @Override
    public Court updateCourt(Integer id, Court courtDetails) {
        Court court = getCourtById(id);

        court.setName(courtDetails.getName());
        court.setDescription(courtDetails.getDescription());
        court.setStatus(courtDetails.getStatus());
        court.setHasFixedTimeSlots(courtDetails.getHasFixedTimeSlots());

        return courtRepository.save(court);
    }

    @Override
    public void deleteCourt(Integer id) {
        Court court = getCourtById(id);
        courtRepository.delete(court);
    }

    @Override
    public List<Court> getCourtsWithFixedTimeSlots() {
        return courtRepository.findCourtsWithFixedTimeSlots();
    }

    @Override
    public List<Court> getCourtsWithoutFixedTimeSlots() {
        return courtRepository.findCourtsWithoutFixedTimeSlots();
    }
}
