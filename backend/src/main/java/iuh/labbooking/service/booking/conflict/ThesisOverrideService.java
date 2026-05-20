package iuh.labbooking.service.booking.conflict;

import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.StatusChangeReason;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.repository.BookingParticipantRepository;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.service.booking.BookingHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ThesisOverrideService {

    private final BookingConflictQueryService conflictQueryService;
    private final BookingRequestRepository bookingRequestRepository;
    private final BookingParticipantRepository bookingParticipantRepository;
    private final BookingHistoryService bookingHistoryService;

    public void cancelConflictingPersonalAndGroupBookings(BookingRequest thesisBooking, LocalDate date, List<Long> slotIds) {
        List<BookingRequest> conflicts = conflictQueryService.findActivePersonalOrGroupBookingsInRoom(
                thesisBooking.getLabRoom().getLabRoomId(),
                date,
                slotIds);

        List<Long> conflictIds = conflicts.stream()
            .map(BookingRequest::getBookingRequestId)
            .sorted(Comparator.naturalOrder())
            .toList();

        List<BookingRequest> updatedConflicts = new ArrayList<>();

        for (Long conflictId : conflictIds) {
            BookingRequest conflict = bookingRequestRepository.lockByBookingRequestId(conflictId)
                .orElse(null);
            if (conflict == null) {
            continue;
            }

            if (conflict.getStatus() != RequestStatus.PENDING && conflict.getStatus() != RequestStatus.APPROVED) {
            continue;
            }

            RequestStatus oldStatus = conflict.getStatus();
            conflict.setStatus(RequestStatus.CANCELLED_BY_PRIORITY_BOOKING);
            conflict.setResponseNote("Cancelled because a priority thesis booking occupies this room and slot.");

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
        }

        if (!updatedConflicts.isEmpty()) {
            bookingRequestRepository.saveAll(updatedConflicts);
        }
    }
}
