package iuh.labbooking.dto.response.booking;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ScheduleConflictAction;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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
        List<ConflictDeviceResponse> devices,
        ScheduleConflictAction suggestedAction
) {
}
