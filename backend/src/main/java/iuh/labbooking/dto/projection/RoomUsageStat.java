package iuh.labbooking.dto.projection;

public record RoomUsageStat(
        Long roomId,
        String roomName,
        long bookingCount,
        long totalSlots,
        int roomCapacity,
        long totalAttendees,
        long thesisCount
) {}
