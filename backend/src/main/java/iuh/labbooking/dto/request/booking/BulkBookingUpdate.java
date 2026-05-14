package iuh.labbooking.dto.request.booking;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BulkBookingUpdate(
        @NotEmpty(message = "Request IDs list cannot be empty") List<Long> requestIds,

        String reason) {
}
