package iuh.labbooking.dto.request.booking;

import jakarta.validation.constraints.Size;

public record CancelBookingRequest(
        @Size(max = 500, message = "Cancel reason must be less than 500 characters")
        String cancelReason
) {
}
