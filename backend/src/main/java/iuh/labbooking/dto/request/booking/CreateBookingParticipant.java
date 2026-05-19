package iuh.labbooking.dto.request.booking;

import iuh.labbooking.enums.ParticipantRole;
import jakarta.validation.constraints.NotNull;

public record CreateBookingParticipant(
        @NotNull Long userId,
        @NotNull ParticipantRole role
) {
}
