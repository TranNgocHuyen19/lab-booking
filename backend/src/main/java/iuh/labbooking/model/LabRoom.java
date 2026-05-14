package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "lab_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long labRoomId;

    @Column(name = "room_name", nullable = false, unique = true)
    private String roomName;

    @Column(name = "building")
    private String building;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "latitude")
    private Double latitude;

    @OneToMany(mappedBy = "labRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<LabRoomDevice> labRoomDevices;
}
