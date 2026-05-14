package iuh.labbooking.dto.request.booking;

import iuh.labbooking.enums.BookingType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record CreateBookingRequest(
        @NotNull(message = "Lab room ID is required") Long labRoomId,

        @NotNull(message = "Booking date is required") @FutureOrPresent(message = "Booking date must be today or in the future") LocalDate bookingDate,

        @NotEmpty(message = "At least one slot must be selected") List<Long> slotIds,

        @NotNull(message = "Booking type is required") BookingType bookingType,

        @NotBlank(message = "Purpose is required") @Size(max = 500, message = "Purpose must not exceed 500 characters") String purpose,

        List<AddParticipantRequest> participants,

        Set<Long> researchGroupIds,

        @Valid List<DeviceQuantityRequest> devices,
        Boolean force) {
}
