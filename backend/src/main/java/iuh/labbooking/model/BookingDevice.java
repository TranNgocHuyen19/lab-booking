package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_devices", indexes = {
        @Index(name = "idx_booking_device_device_booking", columnList = "device_id, booking_request_id")
})
@IdClass(BookingDeviceId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDevice {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_request_id")
    private BookingRequest bookingRequest;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
