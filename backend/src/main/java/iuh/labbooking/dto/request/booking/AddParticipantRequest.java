package iuh.labbooking.dto.request.booking;

import iuh.labbooking.enums.ParticipantRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddParticipantRequest(
        @NotBlank(message = "Username is required") String username,
        @NotNull(message = "Participant role is required") ParticipantRole role) {
}
