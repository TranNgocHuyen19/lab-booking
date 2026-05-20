package iuh.labbooking.listener;

import iuh.labbooking.event.BookingCancelledByThesisEvent;
import iuh.labbooking.event.BookingCreatedEvent;
import iuh.labbooking.event.BookingStatusChangedEvent;
import iuh.labbooking.event.ParticipantConflictRequiredEvent;
import iuh.labbooking.event.ParticipantConflictResolvedEvent;
import iuh.labbooking.event.ThesisParticipantAddedEvent;
import iuh.labbooking.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingNotificationEventListener {

    private final NotificationService notificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookingCreatedEvent(BookingCreatedEvent event) {
        log.info("Creating BOOKING_CREATED notification after commit for bookingRequestId={}", event.bookingRequestId());
        notificationService.handleBookingCreated(event.bookingRequestId(), event.actorId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookingStatusChangedEvent(BookingStatusChangedEvent event) {
        log.info("Creating booking status notification after commit for bookingRequestId={}, newStatus={}",
                event.bookingRequestId(), event.newStatus());
        notificationService.handleBookingStatusChanged(event.bookingRequestId(), event.newStatus(), event.actorId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleParticipantConflictRequiredEvent(ParticipantConflictRequiredEvent event) {
        log.info("Creating PARTICIPANT_CONFLICT_REQUIRED notification after commit for bookingRequestId={}, participantId={}, userId={}",
                event.bookingRequestId(), event.participantId(), event.userId());
        notificationService.handleParticipantConflictRequired(
                event.bookingRequestId(),
                event.participantId(),
                event.userId(),
                event.actorId()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookingCancelledByThesisEvent(BookingCancelledByThesisEvent event) {
        log.info("Creating BOOKING_CANCELLED_BY_THESIS notifications after commit for thesisRequestId={}, cancelledCount={}",
                event.thesisBookingRequestId(), event.cancelledBookingRequestIds().size());
        notificationService.handleBookingCancelledByThesis(
                event.thesisBookingRequestId(),
                event.cancelledBookingRequestIds()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleParticipantConflictResolvedEvent(ParticipantConflictResolvedEvent event) {
        log.info("Creating PARTICIPANT_CONFLICT_RESOLVED notifications after commit for participantId={}",
                event.participantId());
        notificationService.handleParticipantConflictResolved(
                event.bookingRequestId(),
                event.participantId(),
                event.userId()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleThesisParticipantAddedEvent(ThesisParticipantAddedEvent event) {
        log.info("Creating THESIS_PARTICIPANT_ADDED notifications after commit for bookingRequestId={}, addedCount={}",
                event.bookingRequestId(), event.addedParticipantIds().size());
        notificationService.handleThesisParticipantAdded(
                event.bookingRequestId(),
                event.actorId(),
                event.addedParticipantIds()
        );
    }
}
