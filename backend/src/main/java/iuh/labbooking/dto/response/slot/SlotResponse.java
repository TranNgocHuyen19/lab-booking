package iuh.labbooking.dto.response.slot;

import java.time.LocalTime;

public record SlotResponse(
        Long slotId,
        String slotName,
        LocalTime startTime,
        LocalTime endTime,
        String description
) {
}
