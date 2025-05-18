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
        Byte trongStatusId = 1; // ID cho trạng thái "Trống" từ bảng StatusTypes
        StatusType trongStatus = statusTypeRepository.findById(trongStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
        
        return courtRepository.findByStatus(trongStatus);
    }

    @Override
    public Court createCourt(Court court) {
        if (court.getStatus() == null) {
            StatusType defaultStatus = statusTypeRepository.findById((byte)1)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạng thái 'Trống'"));
            court.setStatus(defaultStatus);
        }
        return courtRepository.save(court);
    }

    @Override
    public Court updateCourt(Integer id, Court courtDetails) {
        Court court = getCourtById(id);

        court.setName(courtDetails.getName());
        court.setDescription(courtDetails.getDescription());
        
        if (courtDetails.getStatus() != null) {
            court.setStatus(courtDetails.getStatus());
        }
        
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
