package iuh.labbooking.dto.projection;

import iuh.labbooking.enums.BookingType;

public record GroupDistributionStat(
    Long slotId,
    String slotName,
    BookingType bookingType,
    long slotCount
) {}
