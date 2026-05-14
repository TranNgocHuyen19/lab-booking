package iuh.labbooking.dto.request.booking;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record BookingBySlotRequest(
        @NotNull(message = "Room ID is required")
        Long roomId,

        @NotNull(message = "Date is required")
        LocalDate date,

        @NotNull(message = "Slot ID is required")
        Long slotId
) {}
