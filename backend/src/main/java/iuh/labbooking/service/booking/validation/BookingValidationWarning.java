package iuh.labbooking.service.booking.validation;

import iuh.labbooking.exception.ErrorCode;

public record BookingValidationWarning(
        String code,
        String message,
        Long relatedUserId,
        Long relatedBookingRequestId
) {
    public static BookingValidationWarning of(String code, String message) {
        return new BookingValidationWarning(code, message, null, null);
    }

    public static BookingValidationWarning of(ErrorCode errorCode) {
        return new BookingValidationWarning(errorCode.name(), errorCode.getMessage(), null, null);
    }
}
