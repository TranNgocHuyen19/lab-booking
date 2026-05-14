package iuh.labbooking.model;

import iuh.labbooking.enums.CheckinStatus;
import iuh.labbooking.enums.CheckoutStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_slot_attendances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingSlotAttendance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_slot_attendance_id")
    private Long bookingSlotAttendanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_request_id")
    private BookingRequest bookingRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_participant_id")
    private BookingParticipant bookingParticipant;

    @Column(name = "checkin_at")
    private LocalDateTime checkinAt;

    @Column(name = "checkin_lat")
    private Double checkinLat;

    @Column(name = "checkin_lng")
    private Double checkinLng;

    @Column(name = "checkin_distance_meters")
    private Double checkinDistanceMeters;

    @Column(name = "late_checkin_minutes")
    private Integer lateCheckinMinutes;

    @Column(name = "checkout_at")
    private LocalDateTime checkoutAt;

    @Column(name = "checkout_lat")
    private Double checkoutLat;

    @Column(name = "checkout_lng")
    private Double checkoutLng;

    @Column(name = "checkout_distance_meters")
    private Double checkoutDistanceMeters;

    @Column(name = "early_checkout_minutes")
    private Integer earlyCheckoutMinutes;

    @Column(name = "late_checkout_minutes")
    private Integer lateCheckoutMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkin_status")
    private CheckinStatus checkinStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkout_status")
    private CheckoutStatus checkoutStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_system_config_id")
    private AttendanceSystemConfig attendanceSystemConfig;

    @Column(name = "checkin_note", length = 500)
    private String checkinNote;

    @Column(name = "checkout_note", length = 500)
    private String checkoutNote;
}
