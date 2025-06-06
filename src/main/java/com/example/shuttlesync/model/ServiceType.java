package com.example.shuttlesync.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ServiceTypes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "services")
public class ServiceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "TypeName", nullable = false, length = 100)
    private String typeName;

    @Column(name = "Description", length = 255)
    private String description;

    @OneToMany(mappedBy = "serviceType", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Service> services = new ArrayList<>();
    
    // Phương thức helper để thêm service vào loại dịch vụ này
    public void addService(Service service) {
        services.add(service);
        service.setServiceType(this);
    }
    
    // Phương thức helper để xóa service khỏi loại dịch vụ này
    public void removeService(Service service) {
        services.remove(service);
        service.setServiceType(null);
    }
}
