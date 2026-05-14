package iuh.labbooking.model;

import iuh.labbooking.enums.ParticipantRole;
import iuh.labbooking.enums.ParticipantStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_participants", indexes = {
        @Index(name = "idx_booking_participant_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingParticipant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingParticipantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_request_id")
    private BookingRequest bookingRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private ParticipantRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ParticipantStatus status;
}
