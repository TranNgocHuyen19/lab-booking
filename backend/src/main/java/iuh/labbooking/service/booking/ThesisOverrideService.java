package iuh.labbooking.service.booking;

import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.StatusChangeReason;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.repository.BookingParticipantRepository;
import iuh.labbooking.repository.BookingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

        for (BookingRequest conflict : conflicts) {
            RequestStatus oldStatus = conflict.getStatus();
            conflict.setStatus(RequestStatus.CANCELLED_BY_PRIORITY_BOOKING);
            conflict.setResponseNote("Cancelled because a priority thesis booking occupies this room and slot.");

            bookingParticipantRepository.findByBookingRequest(conflict)
                    .forEach(participant -> participant.setStatus(iuh.labbooking.enums.ParticipantStatus.CANCELED));

            bookingHistoryService.saveStatusChange(
                    conflict,
                    oldStatus,
                    RequestStatus.CANCELLED_BY_PRIORITY_BOOKING,
                    StatusChangeReason.SYSTEM_OVERRIDE_THESIS,
                    conflict.getResponseNote(),
                    thesisBooking.getBookingRequestId());
        }

        bookingRequestRepository.saveAll(conflicts);
    }
}
