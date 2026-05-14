package iuh.labbooking.dto.request.attendance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CheckInRequest(
        @NotNull(message = "Latitude is required") Double latitude,

        @NotNull(message = "Longitude is required") Double longitude,

        @Size(max = 500, message = "Note cannot exceed 500 characters")
        String note) {
}
