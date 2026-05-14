package iuh.labbooking.dto.response.dashboard;

import java.time.LocalDate;

public record BookingTrendResponse(
        LocalDate date,
        long count
) {
}
