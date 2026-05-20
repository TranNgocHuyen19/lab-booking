package iuh.labbooking.service.booking.conflict;

import iuh.labbooking.dto.request.booking.ResolveParticipantConflictRequest;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.ScheduleConflictAction;
import iuh.labbooking.enums.StatusChangeReason;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.BookingParticipant;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.SlotBooking;
import iuh.labbooking.repository.BookingParticipantRepository;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.BookingSlotAttendanceRepository;
import iuh.labbooking.service.booking.BookingHistoryService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.model.BookingSlotAttendance;
import iuh.labbooking.model.AttendanceSystemConfig;
import iuh.labbooking.enums.CheckinStatus;
import iuh.labbooking.enums.CheckoutStatus;
import iuh.labbooking.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResolveScheduleConflictService {

    private final BookingRequestRepository bookingRequestRepository;
    private final BookingParticipantRepository bookingParticipantRepository;
    private final BookingHistoryService bookingHistoryService;
    private final BookingSlotAttendanceRepository bookingSlotAttendanceRepository;
    private final BookingConflictQueryService conflictQueryService;
    private final SystemConfigurationService configService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void resolveParticipantConflict(Long currentUserId, Long participantId, ResolveParticipantConflictRequest request) {
        log.info("Resolving participant schedule conflict: userId={}, participantId={}, action={}, conflictingBookingRequestId={}",
                currentUserId,
                participantId,
                request.action(),
                request.conflictingBookingRequestId());
        BookingParticipant participant = bookingParticipantRepository.lockByBookingParticipantId(participantId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_A_PARTICIPANT));

        if (!participant.getUser().getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
        }

        BookingRequest groupBooking = participant.getBookingRequest();
        if (groupBooking.getBookingType() != BookingType.GROUP
                || !BookingConflictQueryService.ACTIVE_BOOKING_STATUSES.contains(groupBooking.getStatus())
                || participant.getStatus() != ParticipantStatus.PENDING_CONFLICT_RESOLUTION) {
            throw new AppException(ErrorCode.NOT_A_PARTICIPANT);
        }

        if (request.action() == ScheduleConflictAction.KEEP_EXISTING_BOOKING) {
            participant.setStatus(ParticipantStatus.DECLINED);
            bookingParticipantRepository.save(participant);
            log.info("Participant kept existing booking and declined group booking: userId={}, participantId={}, groupBookingId={}",
                    currentUserId,
                    participantId,
                    groupBooking.getBookingRequestId());
            eventPublisher.publishEvent(new ParticipantConflictResolvedEvent(
                    groupBooking.getBookingRequestId(),
                    participantId,
                    currentUserId,
                    request.action()
            ));
            return;
        }

        BookingRequest conflictingPersonalBooking = findConflictingPersonalBooking(
                currentUserId,
                groupBooking,
                request.conflictingBookingRequestId());

        if (conflictingPersonalBooking.getBookingType() != BookingType.PERSONAL
                || !conflictingPersonalBooking.getRequester().getUserId().equals(currentUserId)
                || !BookingConflictQueryService.ACTIVE_BOOKING_STATUSES.contains(conflictingPersonalBooking.getStatus())) {
            throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
        }

        RequestStatus oldStatus = conflictingPersonalBooking.getStatus();
        conflictingPersonalBooking.setStatus(RequestStatus.CANCELED);
        bookingRequestRepository.save(conflictingPersonalBooking);
        log.info("Canceled conflicting personal booking for participant switch: userId={}, personalBookingId={}, oldStatus={}, groupBookingId={}",
                currentUserId,
                conflictingPersonalBooking.getBookingRequestId(),
                oldStatus,
                groupBooking.getBookingRequestId());

        bookingSlotAttendanceRepository.deleteByBookingRequest(conflictingPersonalBooking);

        List<BookingParticipant> personalParticipants =
                bookingParticipantRepository.findByBookingRequest(conflictingPersonalBooking);
        personalParticipants.forEach(personalParticipant ->
                personalParticipant.setStatus(ParticipantStatus.CANCELLED));
        bookingParticipantRepository.saveAll(personalParticipants);

        bookingHistoryService.saveStatusChange(
                conflictingPersonalBooking,
                oldStatus,
                RequestStatus.CANCELED,
                StatusChangeReason.USER_CANCELED,
                "Cancelled to join a group booking.",
                groupBooking.getBookingRequestId());

        participant.setStatus(ParticipantStatus.CONFIRMED);
        bookingParticipantRepository.save(participant);
        log.info("Participant confirmed into group booking after conflict switch: userId={}, participantId={}, groupBookingId={}",
                currentUserId,
                participantId,
                groupBooking.getBookingRequestId());

        if (groupBooking.getStatus() == RequestStatus.APPROVED) {
            boolean exists = bookingSlotAttendanceRepository
                    .existsByBookingRequestAndBookingParticipant(groupBooking, participant);
            if (!exists) {
                AttendanceSystemConfig attendanceSnapshot = configService.createAttendanceSnapshot();
                BookingSlotAttendance attendance = BookingSlotAttendance.builder()
                        .bookingRequest(groupBooking)
                        .bookingParticipant(participant)
                        .attendanceSystemConfig(attendanceSnapshot)
                        .checkinStatus(CheckinStatus.NOT_CHECKED_IN)
                        .checkoutStatus(CheckoutStatus.NOT_CHECKED_OUT)
                        .build();
                bookingSlotAttendanceRepository.save(attendance);
                log.info("Created attendance record for switched participant: groupBookingId={}, participantId={}",
                        groupBooking.getBookingRequestId(),
                        participantId);
            } else {
                log.debug("Attendance already exists for switched participant: groupBookingId={}, participantId={}",
                        groupBooking.getBookingRequestId(),
                        participantId);
            }
        }

        eventPublisher.publishEvent(new ParticipantConflictResolvedEvent(
                groupBooking.getBookingRequestId(),
                participantId,
                currentUserId,
                request.action()
        ));
        log.info("Published participant conflict resolved event: groupBookingId={}, participantId={}, userId={}, action={}",
                groupBooking.getBookingRequestId(),
                participantId,
                currentUserId,
                request.action());
    }

    private BookingRequest findConflictingPersonalBooking(
            Long currentUserId,
            BookingRequest groupBooking,
            Long requestedConflictBookingId) {
        if (requestedConflictBookingId != null) {
            return bookingRequestRepository
                    .lockByBookingRequestId(requestedConflictBookingId)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        }

        if (groupBooking.getSlotBookings() == null || groupBooking.getSlotBookings().isEmpty()) {
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }

        for (SlotBooking slotBooking : groupBooking.getSlotBookings()) {
            if (slotBooking.getBookingDate() == null || slotBooking.getSlot() == null) {
                continue;
            }

            List<BookingRequest> conflicts = conflictQueryService.findActivePersonalBookingsForUser(
                    currentUserId,
                    slotBooking.getBookingDate(),
                    List.of(slotBooking.getSlot().getSlotId()));
            if (!conflicts.isEmpty()) {
                return bookingRequestRepository
                        .lockByBookingRequestId(conflicts.getFirst().getBookingRequestId())
                        .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
            }
        }

        throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
    }
}
