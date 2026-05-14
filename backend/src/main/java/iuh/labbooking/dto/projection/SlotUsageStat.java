package iuh.labbooking.dto.projection;

public record SlotUsageStat(
        Long slotId,
        String slotName,
        long bookingCount,
        long totalDays
) {}
