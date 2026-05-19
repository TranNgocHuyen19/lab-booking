package iuh.labbooking.dto.response.booking;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;

public record ParticipantConflictResponse(
        Long userId,
        Long conflictingBookingRequestId,
        BookingType conflictingBookingType,
        ParticipantStatus suggestedParticipantStatus,
        String message
) {
}
