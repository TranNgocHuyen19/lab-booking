package iuh.labbooking.dto.response.schedule;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record DayScheduleResponse(
                LocalDate date,
                List<SlotScheduleResponse> slots) {
}
