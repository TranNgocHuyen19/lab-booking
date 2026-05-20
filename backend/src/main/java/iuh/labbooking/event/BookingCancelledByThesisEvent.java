package iuh.labbooking.event;

import java.util.List;

public record BookingCancelledByThesisEvent(
        Long thesisBookingRequestId,
        List<Long> cancelledBookingRequestIds
) {
}
