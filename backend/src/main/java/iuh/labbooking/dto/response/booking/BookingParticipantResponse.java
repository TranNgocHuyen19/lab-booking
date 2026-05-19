package iuh.labbooking.dto.response.booking;

import iuh.labbooking.enums.ParticipantRole;
import iuh.labbooking.enums.ParticipantStatus;

public record BookingParticipantResponse(
        Long participantId,
        Long userId,
        String username,
        String fullName,
        ParticipantRole role,
        ParticipantStatus status
) {
}
