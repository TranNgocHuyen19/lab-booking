package iuh.labbooking.service.booking.conflict;

import iuh.labbooking.enums.ParticipantStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipantConflictService {

    private final BookingConflictQueryService conflictQueryService;

    public ParticipantStatus resolveStatusForGroupParticipant(Long userId, LocalDate date, List<Long> slotIds) {
        if (conflictQueryService.userHasActivePersonalBooking(userId, date, slotIds)) {
            return ParticipantStatus.PENDING_CONFLICT_RESOLUTION;
        }
        return ParticipantStatus.INVITED;
    }
}
