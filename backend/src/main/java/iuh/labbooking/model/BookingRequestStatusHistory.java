package iuh.labbooking.model;

import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.StatusChangeReason;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "booking_request_status_history", indexes = {
        @Index(name = "idx_booking_history_booking", columnList = "booking_request_id"),
        @Index(name = "idx_booking_history_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BookingRequestStatusHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_request_id", nullable = false)
    private BookingRequest bookingRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private RequestStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private RequestStatus toStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_reason", nullable = false)
    private StatusChangeReason changeReason;

    @Column(name = "related_booking_request_id")
    private Long relatedBookingRequestId;

    @Column(columnDefinition = "TEXT")
    private String note;
}


//private void saveBookingHistory(
//        BookingRequest request,
//        RequestStatus oldStatus,
//        RequestStatus newStatus,
//        StatusChangeReason reason,
//        String note,
//        Long relatedBookingId
//) {
//    BookingRequestStatusHistory history = BookingRequestStatusHistory.builder()
//            .bookingRequest(request)
//            .fromStatus(oldStatus)
//            .toStatus(newStatus)
//            .changeReason(reason)
//            .note(note)
//            .modifiedBy(performedBy)
//            .relatedBookingRequestId(relatedBookingId)
//            .build();


