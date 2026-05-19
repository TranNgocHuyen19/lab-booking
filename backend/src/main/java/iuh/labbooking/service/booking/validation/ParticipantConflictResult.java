package iuh.labbooking.service.booking.validation;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;

public record ParticipantConflictResult(
        Long userId,
        Long conflictingBookingRequestId,
        BookingType conflictingBookingType,
        ParticipantStatus suggestedParticipantStatus,
        String message
) {
}
