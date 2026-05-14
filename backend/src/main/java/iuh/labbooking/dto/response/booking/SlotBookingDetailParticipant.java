package iuh.labbooking.dto.response.booking;

import iuh.labbooking.enums.ParticipantRole;
import lombok.Builder;

@Builder
public record SlotBookingDetailParticipant(
        Long participantId,
        Long userId,
        String username,
        String fullName,
        ParticipantRole role,
        String memberRole
) {
}
