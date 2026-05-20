package iuh.labbooking.dto.request.booking;

import iuh.labbooking.enums.ScheduleConflictAction;
import jakarta.validation.constraints.NotNull;

public record ResolveParticipantConflictRequest(
        @NotNull ScheduleConflictAction action,
        Long conflictingBookingRequestId
) {
}
