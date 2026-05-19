package iuh.labbooking.service.booking.strategy;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.service.booking.validation.BookingValidationResult;

public interface BookingCreationStrategy {

    BookingType bookingType();

    BookingValidationResult validate(BookingCreationContext context);

    BookingRequest create(BookingCreationContext context, BookingValidationResult validationResult);

    default void afterCreated(BookingRequest bookingRequest, BookingCreationContext context) {
    }
}
