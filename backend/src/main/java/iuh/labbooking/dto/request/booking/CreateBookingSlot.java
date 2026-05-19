package iuh.labbooking.dto.request.booking;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateBookingSlot(
        @NotNull Long slotId,
        @NotNull LocalDate bookingDate
) {
}
