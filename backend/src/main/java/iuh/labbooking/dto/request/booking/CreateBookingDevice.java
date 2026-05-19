package iuh.labbooking.dto.request.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateBookingDevice(
        @NotNull Long deviceId,
        @NotNull @Min(1) Integer quantity
) {
}
