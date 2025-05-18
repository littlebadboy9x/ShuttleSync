package com.example.shuttlesync.service.impl;

import com.example.shuttlesync.model.StatusType;
import com.example.shuttlesync.repository.StatusTypeRepository;
import com.example.shuttlesync.service.StatusTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StatusTypeServiceImpl implements StatusTypeService {

    private final StatusTypeRepository statusTypeRepository;

    @Override
    public List<StatusType> getAllStatusTypes() {
        return statusTypeRepository.findAll();
    }

    @Override
    public Optional<StatusType> getStatusTypeById(Byte id) {
        return statusTypeRepository.findById(id);
    }

    @Override
    public Optional<StatusType> getStatusTypeByName(String name) {
        return statusTypeRepository.findByName(name);
    }
} 