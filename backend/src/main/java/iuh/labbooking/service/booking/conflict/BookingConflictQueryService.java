package iuh.labbooking.service.booking.conflict;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.model.BookingParticipant;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.repository.BookingParticipantRepository;
import iuh.labbooking.repository.BookingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingConflictQueryService {

    public static final List<RequestStatus> ACTIVE_BOOKING_STATUSES = List.of(
            RequestStatus.PENDING,
            RequestStatus.APPROVED
    );

    public static final List<ParticipantStatus> OCCUPYING_PARTICIPANT_STATUSES = List.of(
            ParticipantStatus.CONFIRMED,
            ParticipantStatus.PENDING_CONFLICT_RESOLUTION
    );

    private final BookingParticipantRepository bookingParticipantRepository;
    private final BookingRequestRepository bookingRequestRepository;

    public boolean userHasActivePersonalBooking(Long userId, LocalDate date, List<Long> slotIds) {
        return !findActivePersonalBookingsForUser(userId, date, slotIds).isEmpty();
    }

    public List<BookingRequest> findActivePersonalBookingsForUser(Long userId, LocalDate date, List<Long> slotIds) {
        return bookingRequestRepository.findActiveBookingsByUserDateSlotsAndType(
                userId,
                date,
                slotIds,
                BookingType.PERSONAL,
                ACTIVE_BOOKING_STATUSES);
    }

    public boolean userHasConfirmedGroupBooking(Long userId, LocalDate date, List<Long> slotIds) {
        return bookingParticipantRepository.existsGroupBookingForUserByParticipantStatus(
                userId,
                date,
                slotIds,
                ACTIVE_BOOKING_STATUSES,
                ParticipantStatus.CONFIRMED);
    }

    public List<BookingParticipant> findSoftGroupConflicts(Long userId, LocalDate date, List<Long> slotIds) {
        return bookingParticipantRepository.findGroupParticipantsForUserByStatuses(
                userId,
                date,
                slotIds,
                ACTIVE_BOOKING_STATUSES,
                List.of(ParticipantStatus.INVITED, ParticipantStatus.PENDING_CONFLICT_RESOLUTION));
    }

    public boolean researchGroupHasActiveGroupBooking(Long researchGroupId, LocalDate date, List<Long> slotIds) {
        return bookingRequestRepository.existsActiveGroupBookingForResearchGroup(
                researchGroupId,
                date,
                slotIds,
                ACTIVE_BOOKING_STATUSES);
    }

    public boolean roomHasActiveThesisBooking(Long labRoomId, LocalDate date, List<Long> slotIds) {
        return !bookingRequestRepository.findActiveBookingsByRoomDateSlotsAndTypes(
                labRoomId,
                date,
                slotIds,
                List.of(BookingType.THESIS),
                ACTIVE_BOOKING_STATUSES).isEmpty();
    }

    public List<BookingRequest> findActivePersonalOrGroupBookingsInRoom(Long labRoomId, LocalDate date, List<Long> slotIds) {
        return bookingRequestRepository.findActiveBookingsByRoomDateSlotsAndTypes(
                labRoomId,
                date,
                slotIds,
                List.of(BookingType.PERSONAL, BookingType.GROUP),
                ACTIVE_BOOKING_STATUSES);
    }

    public long countOccupiedSeats(Long labRoomId, LocalDate date, Long slotId) {
        return bookingParticipantRepository.countOccupiedSeats(
                labRoomId,
                date,
                slotId,
                ACTIVE_BOOKING_STATUSES,
                OCCUPYING_PARTICIPANT_STATUSES);
    }

    public long countOccupiedSeatsExcludingBooking(Long labRoomId, LocalDate date, Long slotId, Long excludeId) {
        return bookingParticipantRepository.countOccupiedSeatsExcludingBooking(
                labRoomId,
                date,
                slotId,
                ACTIVE_BOOKING_STATUSES,
                OCCUPYING_PARTICIPANT_STATUSES,
                excludeId);
    }
}
