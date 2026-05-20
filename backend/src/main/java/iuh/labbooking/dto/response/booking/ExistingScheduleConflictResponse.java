package iuh.labbooking.dto.response.booking;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ScheduleConflictAction;

import java.time.LocalDate;

public record ExistingScheduleConflictResponse(
        String code,
        String message,
        Long userId,
        Long conflictingBookingRequestId,
        BookingType conflictingBookingType,
        LocalDate bookingDate,
        Long slotId,
        ScheduleConflictAction suggestedAction
) {
}
