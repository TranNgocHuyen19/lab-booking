package iuh.labbooking.dto.projection;

public record RoomSlotUsageStat(
        Long roomId,
        String roomName,
        Long slotId,
        String slotName,
        String startTime,
        String endTime,
        long bookingCount,
        int roomCapacity,
        long totalAttendees,
        long thesisCount
) {}
