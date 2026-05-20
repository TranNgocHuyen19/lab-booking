package iuh.labbooking.event;

public record ParticipantConflictRequiredEvent(
        Long bookingRequestId,
        Long participantId,
        Long userId,
        Long actorId
) {
}
