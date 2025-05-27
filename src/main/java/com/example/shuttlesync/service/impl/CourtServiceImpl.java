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

    @Override
    public Court toggleCourtStatus(Integer id) {
        Court court = getCourtById(id);
        
        // Rotate through status: Trống (1) -> Đầy (2) -> Bảo trì (3) -> Trống (1)
        byte currentStatusId = court.getStatus().getId();
        byte newStatusId;
        
        switch (currentStatusId) {
            case 1: // Trống -> Đầy
                newStatusId = 2;
                break;
            case 2: // Đầy -> Bảo trì
                newStatusId = 3;
                break;
            case 3: // Bảo trì -> Trống
                newStatusId = 1;
                break;
            default:
                newStatusId = 1; // Mặc định về trạng thái Trống
        }
        
        StatusType newStatus = statusTypeRepository.findById(newStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("Status type not found with ID: " + newStatusId));
        
        court.setStatus(newStatus);
        return courtRepository.save(court);
    }
}
