package iuh.labbooking.dto.projection;

import iuh.labbooking.enums.BookingType;

public record BookingTypeStat(
    BookingType bookingType,
    long count
) {}
