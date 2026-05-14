package iuh.labbooking.dto.response.schedule;

import lombok.Builder;

import java.time.LocalTime;
import java.util.List;

@Builder
public record SlotScheduleResponse(
        Long slotId,
        String slotName,
        LocalTime startTime,
        LocalTime endTime,
        String status,
        List<Long> bookingRequestIds,
        Integer participantCount,
        Integer roomCapacity,
        Integer pendingCount) {
}