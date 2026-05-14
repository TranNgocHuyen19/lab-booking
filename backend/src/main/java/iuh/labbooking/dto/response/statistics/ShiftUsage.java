package iuh.labbooking.dto.response.statistics;

public record ShiftUsage(
        Long slotId,
        String slotName,
        String timeRange,
        double usageRate,
        int bookingCount
) {}
