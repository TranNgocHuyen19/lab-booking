package iuh.labbooking.dto.response.slot;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record SecureSlotResponse(
        Long slotId,
        String slotName,
        LocalTime startTime,
        LocalTime endTime,
        String description,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime modifiedAt,
        String modifiedBy,
        boolean active
) {
}
