package iuh.labbooking.dto.request.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DeviceQuantityRequest(
        @NotNull(message = "Device ID is required") Long deviceId,

        @NotNull(message = "Quantity is required") @Min(value = 1, message = "Quantity must be at least 1") Integer quantity) {
}
