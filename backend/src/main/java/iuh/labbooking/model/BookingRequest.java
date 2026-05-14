package iuh.labbooking.model;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "booking_requests", indexes = {
        @Index(name = "idx_booking_request_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingRequestId;

    @Column(name = "purpose")
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type")
    private BookingType bookingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RequestStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private User requester;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "response_note", columnDefinition = "TEXT")
    private String responseNote;

    @Column(name = "response_date")
    private LocalDateTime responseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_by_id")
    private User responseBy;

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "booking_request_research_groups",
            joinColumns = @JoinColumn(name = "booking_request_id"),
            inverseJoinColumns = @JoinColumn(name = "research_group_id")
    )
    private Set<ResearchGroup> researchGroup = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "bookingRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BookingParticipant> participants = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_room_id")
    private LabRoom labRoom;

    @Builder.Default
    @OneToMany(mappedBy = "bookingRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SlotBooking> slotBookings = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "bookingRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BookingDevice> bookingDevices = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_system_config_id")
    private BookingSystemConfig bookingSystemConfig;
}
