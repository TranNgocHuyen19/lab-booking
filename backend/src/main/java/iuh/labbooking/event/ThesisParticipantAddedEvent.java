package iuh.labbooking.event;

import java.util.List;

public record ThesisParticipantAddedEvent(
        Long bookingRequestId,
        List<Long> addedParticipantIds,
        Long actorId
) {
}
