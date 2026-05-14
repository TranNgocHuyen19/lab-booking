package iuh.labbooking.dto.response.statistics;

public record RoomUsageDetailResponse(
        Long roomId,
        String roomName,
        Long slotId,
        String slotName,
        int bookingCount,
        double totalHours,
        int participantCount,
        double usageRate,
        int canceledCount
) {}
