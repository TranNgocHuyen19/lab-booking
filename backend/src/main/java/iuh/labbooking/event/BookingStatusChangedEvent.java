package iuh.labbooking.event;

import iuh.labbooking.enums.RequestStatus;

public record BookingStatusChangedEvent(
        Long bookingRequestId,
        RequestStatus oldStatus,
        RequestStatus newStatus,
        Long actorId
) {
}
