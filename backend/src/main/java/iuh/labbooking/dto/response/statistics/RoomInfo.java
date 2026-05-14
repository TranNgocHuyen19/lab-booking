package iuh.labbooking.dto.response.statistics;

public record RoomInfo(
        String roomName,
        double usageRate,
        int bookingCount
) {}
