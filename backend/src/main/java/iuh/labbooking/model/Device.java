package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deviceId;

    @Column(name = "device_name", nullable = false, unique = true, columnDefinition = "TEXT")
    private String deviceName;

    @Column(name = "device_type", columnDefinition = "TEXT")
    private String deviceType;

    @Column(name = "icon")
    private String icon;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LabRoomDevice> roomDevices;
}
