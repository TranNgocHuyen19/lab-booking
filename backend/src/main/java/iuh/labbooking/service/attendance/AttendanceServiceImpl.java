package iuh.labbooking.service.attendance;

import iuh.labbooking.dto.request.attendance.CheckInRequest;
import iuh.labbooking.dto.request.attendance.CheckOutRequest;
import iuh.labbooking.dto.response.attendance.AttendanceResponse;
import iuh.labbooking.dto.response.attendance.AttendanceStatusResponse;
import iuh.labbooking.enums.CheckinStatus;
import iuh.labbooking.enums.CheckoutStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.AttendanceMapper;
import iuh.labbooking.model.*;
import iuh.labbooking.repository.BookingSlotAttendanceRepository;
import iuh.labbooking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final BookingSlotAttendanceRepository attendanceRepository;
    private final SecurityUtil securityUtil;
    private final AttendanceMapper attendanceMapper;

    @Override
    @Transactional
    public AttendanceResponse checkIn(Long bookingId, CheckInRequest request) {
        User user = securityUtil.getCurrentUser();
        BookingSlotAttendance attendance = getAttendance(bookingId, user);

        if (attendance.getBookingRequest().getStatus() != RequestStatus.APPROVED) {
            throw new AppException(ErrorCode.BOOKING_NOT_APPROVED);
        }

        if (attendance.getCheckinAt() != null) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        AttendanceSystemConfig config = attendance.getAttendanceSystemConfig();
        SlotTime slot = resolveSlotTime(attendance.getBookingRequest());
        LocalDateTime now = LocalDateTime.now();

        long delta = ChronoUnit.MINUTES.between(slot.start(), now);
        if (delta < -config.getEarlyCheckinMinutes()) {
            long minutesUntilAllowed = Math.abs(delta) - config.getEarlyCheckinMinutes();
            throw new AppException(ErrorCode.TOO_EARLY_TO_CHECKIN, Map.of(
                    "earlyCheckinMinutes", config.getEarlyCheckinMinutes(),
                    "minutesUntilAllowed", minutesUntilAllowed,
                    "allowedCheckinTime", slot.start().minusMinutes(config.getEarlyCheckinMinutes()).toString()
            ));
        }

        CheckinStatus status;
        Integer lateMinutes = null;

        if (delta <= config.getLateCheckinMinutes()) {
            status = CheckinStatus.CHECKED_IN;
        } else {
            status = CheckinStatus.LATE;
            lateMinutes = (int) delta;
            if (request.note() == null || request.note().isBlank()) {
                throw new AppException(ErrorCode.NOTE_REQUIRED, Map.of(
                        "reason", "late_checkin",
                        "lateMinutes", lateMinutes,
                        "allowedLateMinutes", config.getLateCheckinMinutes()
                ));
            }
        }

        attendance.setCheckinAt(now);
        attendance.setCheckinStatus(status);
        attendance.setLateCheckinMinutes(lateMinutes);
        attendance.setCheckinNote(request.note());

        attendanceRepository.save(attendance);
        return attendanceMapper.toResponse(attendance);
    }

    @Override
    @Transactional
    public AttendanceResponse checkOut(Long bookingId, CheckOutRequest request) {
        User user = securityUtil.getCurrentUser();
        BookingSlotAttendance attendance = getAttendance(bookingId, user);

        if (attendance.getCheckinAt() == null) {
            throw new AppException(ErrorCode.NOT_CHECKED_IN_YET);
        }

        if (attendance.getCheckoutAt() != null) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_OUT);
        }

        AttendanceSystemConfig config = attendance.getAttendanceSystemConfig();
        SlotTime slot = resolveSlotTime(attendance.getBookingRequest());
        LocalDateTime now = LocalDateTime.now();

        long delta = ChronoUnit.MINUTES.between(slot.end(), now);

        CheckoutStatus status;
        Integer early = null;
        Integer late = null;

        if (delta < 0) {
            status = CheckoutStatus.LEFT_EARLY;
            early = Math.abs((int) delta);
        } else if (delta <= config.getLateCheckoutMinutes()) {
            status = CheckoutStatus.CHECKED_OUT;
        } else {
            status = CheckoutStatus.LATE_CHECKOUT;
            late = (int) delta;
            if (request.note() == null || request.note().isBlank()) {
                throw new AppException(ErrorCode.NOTE_REQUIRED, Map.of(
                        "reason", "late_checkout",
                        "lateMinutes", late,
                        "allowedLateMinutes", config.getLateCheckoutMinutes()
                ));
            }
        }

        attendance.setCheckoutAt(now);
        attendance.setCheckoutStatus(status);
        attendance.setEarlyCheckoutMinutes(early);
        attendance.setLateCheckoutMinutes(late);
        attendance.setCheckoutNote(request.note());

        attendanceRepository.save(attendance);
        return attendanceMapper.toResponse(attendance);
    }

    @Override
    public AttendanceStatusResponse findAttendanceStatusByBookingId(Long bookingId) {
        User user = securityUtil.getCurrentUser();

        BookingSlotAttendance attendance = attendanceRepository
                .findByBookingRequest_BookingRequestIdAndBookingParticipant_User(bookingId, user)
                .orElse(null);

        if (attendance == null || attendance.getBookingRequest().getStatus() != RequestStatus.APPROVED) {
            return AttendanceStatusResponse.builder()
                    .hasCheckedIn(false)
                    .hasCheckedOut(false)
                    .canCheckIn(false)
                    .canCheckOut(false)
                    .build();
        }

        boolean isOwner =
                attendance.getBookingParticipant().getUser().getUserId()
                        .equals(user.getUserId());

        AttendanceSystemConfig config = attendance.getAttendanceSystemConfig();
        SlotTime slot = resolveSlotTime(attendance.getBookingRequest());
        LocalDateTime now = LocalDateTime.now();

        CheckinStatus checkinStatus = null;
        Integer lateCheckin = null;
        boolean needNoteIn = false;

        if (attendance.getCheckinAt() == null) {
            long delta = ChronoUnit.MINUTES.between(slot.start(), now);
            if (delta <= config.getLateCheckinMinutes()) {
                checkinStatus = CheckinStatus.CHECKED_IN;
            } else {
                checkinStatus = CheckinStatus.LATE;
                lateCheckin = (int) delta;
                needNoteIn = true;
            }
        }

        CheckoutStatus checkoutStatus = null;
        Integer earlyOut = null;
        Integer lateOut = null;
        boolean needNoteOut = false;

        if (attendance.getCheckinAt() != null && attendance.getCheckoutAt() == null) {
            long delta = ChronoUnit.MINUTES.between(slot.end(), now);
            if (delta < 0) {
                checkoutStatus = CheckoutStatus.LEFT_EARLY;
                earlyOut = Math.abs((int) delta);
            } else if (delta <= config.getLateCheckoutMinutes()) {
                checkoutStatus = CheckoutStatus.CHECKED_OUT;
            } else {
                checkoutStatus = CheckoutStatus.LATE_CHECKOUT;
                lateOut = (int) delta;
                needNoteOut = true;
            }
        }

        return AttendanceStatusResponse.builder()
                .hasCheckedIn(attendance.getCheckinAt() != null)
                .hasCheckedOut(attendance.getCheckoutAt() != null)
                .canCheckIn(attendance.getCheckinAt() == null)
                .canCheckOut(attendance.getCheckinAt() != null && attendance.getCheckoutAt() == null)
                .calculatedCheckinStatus(checkinStatus)
                .calculatedLateCheckinMinutes(lateCheckin)
                .needNoteForCheckIn(needNoteIn)
                .calculatedCheckoutStatus(checkoutStatus)
                .calculatedEarlyCheckoutMinutes(earlyOut)
                .calculatedLateCheckoutMinutes(lateOut)
                .needNoteForCheckOut(needNoteOut)
                .checkinAt(isOwner ? attendance.getCheckinAt() : null)
                .checkoutAt(isOwner ? attendance.getCheckoutAt() : null)
                .actualLateCheckinMinutes(isOwner ? attendance.getLateCheckinMinutes() : null)
                .actualEarlyCheckoutMinutes(isOwner ? attendance.getEarlyCheckoutMinutes() : null)
                .actualLateCheckoutMinutes(isOwner ? attendance.getLateCheckoutMinutes() : null)
                .checkinNote(isOwner ? attendance.getCheckinNote() : null)
                .checkoutNote(isOwner ? attendance.getCheckoutNote() : null)
                .build();
    }


    @Override
    public List<AttendanceResponse> findAttendancesByBookingId(Long bookingId) {
        if (!securityUtil.isLecturer() && !securityUtil.isAdmin()) {
            throw new AppException(ErrorCode.ATTENDANCE_ACCESS_DENIED);
        }

        return attendanceRepository.findByBookingRequest_BookingRequestId(bookingId)
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    private BookingSlotAttendance getAttendance(Long bookingId, User user) {
        return attendanceRepository
                .findByBookingRequest_BookingRequestIdAndBookingParticipant_User(bookingId, user)
                .orElseThrow(() -> new AppException(ErrorCode.ATTENDANCE_NOT_FOUND));
    }

    private SlotTime resolveSlotTime(BookingRequest booking) {
        SlotBooking first = booking.getSlotBookings().stream()
                .min(Comparator.comparing(sb -> sb.getSlot().getStartTime()))
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NO_SLOTS));

        SlotBooking last = booking.getSlotBookings().stream()
                .max(Comparator.comparing(sb -> sb.getSlot().getEndTime()))
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NO_SLOTS));

        return new SlotTime(
                LocalDateTime.of(first.getBookingDate(), first.getSlot().getStartTime()),
                LocalDateTime.of(last.getBookingDate(), last.getSlot().getEndTime())
        );
    }

    private record SlotTime(
            LocalDateTime start,
            LocalDateTime end
    ) {
    }
}
