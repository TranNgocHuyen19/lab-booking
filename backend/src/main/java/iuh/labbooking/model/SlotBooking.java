package iuh.labbooking.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "slot_bookings", indexes = {
        @Index(name = "idx_slot_booking_date_slot", columnList = "booking_date, slot_id")
})
@IdClass(SlotBookingId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotBooking extends BaseEntity {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_request_id")
    private BookingRequest bookingRequest;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private Slot slot;

    @Column(name = "name")
    private String name;

    @Column(name = "start_time")
    private java.time.LocalTime startTime;

    @Column(name = "end_time")
    private java.time.LocalTime endTime;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;
}
