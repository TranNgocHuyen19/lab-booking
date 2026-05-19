package iuh.labbooking.dto.request.booking;

import iuh.labbooking.enums.BookingType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Set;

public record CreateBookingRequest(
        @NotBlank String purpose,

        @NotNull BookingType bookingType,

        @NotNull(message = "Lab room ID is required") Long labRoomId,

        Set<Long> researchGroupIds,

        @Valid @NotEmpty List<CreateBookingSlot> slots,

        @Valid List<CreateBookingParticipant> participants,

        @Valid List<CreateBookingDevice> devices) {
}
