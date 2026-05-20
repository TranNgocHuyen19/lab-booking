package iuh.labbooking.service.booking.conflict;

import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.StatusChangeReason;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.repository.BookingParticipantRepository;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.service.booking.BookingHistoryService;
import iuh.labbooking.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThesisOverrideService {

    private final BookingConflictQueryService conflictQueryService;
    private final BookingRequestRepository bookingRequestRepository;
    private final BookingParticipantRepository bookingParticipantRepository;
    private final BookingHistoryService bookingHistoryService;
    private final iuh.labbooking.repository.BookingSlotAttendanceRepository bookingSlotAttendanceRepository;
    private final ApplicationEventPublisher eventPublisher;

    public void cancelConflictingPersonalAndGroupBookings(BookingRequest thesisBooking, LocalDate date, List<Long> slotIds) {
        log.info("Checking thesis override conflicts: thesisBookingId={}, labRoomId={}, date={}, slotIds={}",
                thesisBooking.getBookingRequestId(),
                thesisBooking.getLabRoom().getLabRoomId(),
                date,
                slotIds);
        List<BookingRequest> conflicts = conflictQueryService.findActivePersonalOrGroupBookingsInRoom(
                thesisBooking.getLabRoom().getLabRoomId(),
                date,
                slotIds);

        List<Long> conflictIds = conflicts.stream()
            .map(BookingRequest::getBookingRequestId)
            .sorted(Comparator.naturalOrder())
            .toList();
        log.info("Thesis override conflict scan completed: thesisBookingId={}, conflictIds={}",
                thesisBooking.getBookingRequestId(),
                conflictIds);

        List<BookingRequest> updatedConflicts = new ArrayList<>();

        for (Long conflictId : conflictIds) {
            BookingRequest conflict = bookingRequestRepository.lockByBookingRequestId(conflictId)
                .orElse(null);
            if (conflict == null) {
                log.warn("Thesis override conflict disappeared before lock: conflictBookingId={}", conflictId);
                continue;
            }

            if (conflict.getStatus() != RequestStatus.PENDING && conflict.getStatus() != RequestStatus.APPROVED) {
                log.info("Skipping thesis override conflict because status changed: conflictBookingId={}, status={}",
                        conflictId,
                        conflict.getStatus());
                continue;
            }

            RequestStatus oldStatus = conflict.getStatus();
            conflict.setStatus(RequestStatus.CANCELLED_BY_PRIORITY_BOOKING);
            conflict.setResponseNote("Cancelled because a priority thesis booking occupies this room and slot.");

            bookingSlotAttendanceRepository.deleteByBookingRequest(conflict);

            var participants = bookingParticipantRepository.findByBookingRequest(conflict);
            participants.forEach(participant -> participant.setStatus(iuh.labbooking.enums.ParticipantStatus.CANCELLED));
            bookingParticipantRepository.saveAll(participants);

            bookingHistoryService.saveStatusChange(
                    conflict,
                    oldStatus,
                    RequestStatus.CANCELLED_BY_PRIORITY_BOOKING,
                    StatusChangeReason.SYSTEM_OVERRIDE_THESIS,
                    conflict.getResponseNote(),
                    thesisBooking.getBookingRequestId());

            updatedConflicts.add(conflict);
            log.info("Thesis override canceled booking: thesisBookingId={}, conflictBookingId={}, oldStatus={}, participantCount={}",
                    thesisBooking.getBookingRequestId(),
                    conflict.getBookingRequestId(),
                    oldStatus,
                    participants.size());
        }

        if (!updatedConflicts.isEmpty()) {
            bookingRequestRepository.saveAll(updatedConflicts);
            List<Long> cancelledIds = updatedConflicts.stream()
                    .map(BookingRequest::getBookingRequestId)
                    .toList();
            eventPublisher.publishEvent(new BookingCancelledByThesisEvent(thesisBooking.getBookingRequestId(), cancelledIds));
            log.info("Published thesis override cancellation event: thesisBookingId={}, cancelledIds={}",
                    thesisBooking.getBookingRequestId(),
                    cancelledIds);
        } else {
            log.info("No thesis override cancellations needed: thesisBookingId={}", thesisBooking.getBookingRequestId());
        }
    }
}
