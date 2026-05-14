package iuh.labbooking.dto.projection;

import java.time.LocalDate;

public record BookingTrendStat(
        LocalDate date,
        long count
) {
}
