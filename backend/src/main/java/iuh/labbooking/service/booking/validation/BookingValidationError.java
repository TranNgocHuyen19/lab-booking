package iuh.labbooking.service.booking.validation;

import iuh.labbooking.exception.ErrorCode;

public record BookingValidationError(
        String code,
        String message,
        Long relatedUserId,
        Long relatedBookingRequestId
) {
    public static BookingValidationError of(String code, String message) {
        return new BookingValidationError(code, message, null, null);
    }

    public static BookingValidationError of(ErrorCode errorCode) {
        return new BookingValidationError(errorCode.name(), errorCode.getMessage(), null, null);
    }
}
