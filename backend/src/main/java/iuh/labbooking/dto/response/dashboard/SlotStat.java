package iuh.labbooking.dto.response.dashboard;

import java.time.LocalTime;

public record SlotStat(
    String slotName,
    LocalTime startTime,
    LocalTime endTime,
    int count
) {}
