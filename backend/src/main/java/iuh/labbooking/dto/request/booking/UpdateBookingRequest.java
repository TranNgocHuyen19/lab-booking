package iuh.labbooking.dto.request.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateBookingRequest(
                @NotBlank(message = "Purpose is required") @Size(max = 500, message = "Purpose must not exceed 500 characters") String purpose,

                List<AddParticipantRequest> participants,

                @Valid List<DeviceQuantityRequest> devices,
                Boolean force) {
}
