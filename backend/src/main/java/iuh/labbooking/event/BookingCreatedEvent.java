package iuh.labbooking.event;

public record BookingCreatedEvent(
        Long bookingRequestId,
        Long actorId
) {
}
