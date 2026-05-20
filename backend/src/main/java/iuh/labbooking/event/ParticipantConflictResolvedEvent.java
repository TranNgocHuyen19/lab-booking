package iuh.labbooking.event;

import iuh.labbooking.enums.ScheduleConflictAction;

public record ParticipantConflictResolvedEvent(
        Long bookingRequestId,
        Long participantId,
        Long userId,
        ScheduleConflictAction action
) {
}
