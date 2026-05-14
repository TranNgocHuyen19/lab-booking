package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_room_devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabRoomDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_room_id", nullable = false)
    private LabRoom labRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
