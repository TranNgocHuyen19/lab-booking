package iuh.labbooking.dto.response.booking;

public record BookingWarning(
        String code,
        String message,
        Long relatedUserId,
        Long relatedBookingRequestId
) {
}
