package iuh.labbooking.model;

import iuh.labbooking.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "related_booking_request_id")
    private Long relatedBookingRequestId;

    @Column(name = "related_participant_id")
    private Long relatedParticipantId;

    @Column(name = "related_user_id")
    private Long relatedUserId;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON string

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "event_key", unique = true)
    private String eventKey;
}
