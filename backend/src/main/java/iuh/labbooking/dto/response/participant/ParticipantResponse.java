package iuh.labbooking.dto.response.participant;

import iuh.labbooking.enums.ParticipantRole;
import iuh.labbooking.enums.ParticipantStatus;
import lombok.Builder;

@Builder
public record ParticipantResponse(
        Long participantId,
        Long userId,
        String username,
        String fullName,
        ParticipantRole role,
        ParticipantStatus status) {
}
