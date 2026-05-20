package iuh.labbooking.dto.response.booking;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ScheduleConflictAction;

import java.time.LocalDate;
import java.time.LocalTime;

public record ExistingScheduleConflictResponse(
        String code,
        String message,
        Long userId,
        Long conflictingBookingRequestId,
        BookingType conflictingBookingType,
        LocalDate bookingDate,
        Long slotId,
        Long labRoomId,
        String roomName,
        String building,
        String slotName,
        LocalTime startTime,
        LocalTime endTime,
        ScheduleConflictAction suggestedAction
) {
}
