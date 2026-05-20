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
import iuh.labbooking.repository.BookingParticipantRepository;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.BookingSlotAttendanceRepository;
import iuh.labbooking.service.booking.BookingHistoryService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.model.BookingSlotAttendance;
import iuh.labbooking.model.AttendanceSystemConfig;
import iuh.labbooking.enums.CheckinStatus;
import iuh.labbooking.enums.CheckoutStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResolveScheduleConflictService {

    private final BookingRequestRepository bookingRequestRepository;
    private final BookingParticipantRepository bookingParticipantRepository;
    private final BookingHistoryService bookingHistoryService;
    private final BookingSlotAttendanceRepository bookingSlotAttendanceRepository;
    private final SystemConfigurationService configService;

    @Transactional
    public void resolveParticipantConflict(Long currentUserId, Long participantId, ResolveParticipantConflictRequest request) {
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
            return;
        }

        if (request.conflictingBookingRequestId() == null) {
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }

        BookingRequest conflictingPersonalBooking = bookingRequestRepository
                .lockByBookingRequestId(request.conflictingBookingRequestId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (conflictingPersonalBooking.getBookingType() != BookingType.PERSONAL
                || !conflictingPersonalBooking.getRequester().getUserId().equals(currentUserId)
                || !BookingConflictQueryService.ACTIVE_BOOKING_STATUSES.contains(conflictingPersonalBooking.getStatus())) {
            throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
        }

        RequestStatus oldStatus = conflictingPersonalBooking.getStatus();
        conflictingPersonalBooking.setStatus(RequestStatus.CANCELED);
        bookingRequestRepository.save(conflictingPersonalBooking);

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

        if (groupBooking.getStatus() == RequestStatus.APPROVED) {
            AttendanceSystemConfig attendanceSnapshot = configService.createAttendanceSnapshot();
            BookingSlotAttendance attendance = BookingSlotAttendance.builder()
                    .bookingRequest(groupBooking)
                    .bookingParticipant(participant)
                    .attendanceSystemConfig(attendanceSnapshot)
                    .checkinStatus(CheckinStatus.NOT_CHECKED_IN)
                    .checkoutStatus(CheckoutStatus.NOT_CHECKED_OUT)
                    .build();
            bookingSlotAttendanceRepository.save(attendance);
        }
    }
}
