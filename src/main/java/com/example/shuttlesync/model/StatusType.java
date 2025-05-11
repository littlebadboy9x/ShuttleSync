package com.example.shuttlesync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "StatusTypes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusType {

    @Id
    private Byte id;

    @Column(name = "Name", nullable = false, length = 20)
    private String name;

    @Column(name = "Description", length = 100)
    private String description;
} 