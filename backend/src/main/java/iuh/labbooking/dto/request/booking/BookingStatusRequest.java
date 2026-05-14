package iuh.labbooking.dto.request.booking;

import jakarta.validation.constraints.Size;

public record BookingStatusRequest(
        @Size(max = 500, message = "Response note must be less than 500 characters")
        String responseNote
) {
}
