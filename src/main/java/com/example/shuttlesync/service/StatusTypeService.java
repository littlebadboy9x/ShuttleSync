package com.example.shuttlesync.service;

import com.example.shuttlesync.model.StatusType;

import java.util.List;
import java.util.Optional;

public interface StatusTypeService {
    
    List<StatusType> getAllStatusTypes();
    
    Optional<StatusType> getStatusTypeById(Byte id);
    
    Optional<StatusType> getStatusTypeByName(String name);
} 