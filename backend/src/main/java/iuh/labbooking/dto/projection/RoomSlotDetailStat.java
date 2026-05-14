package iuh.labbooking.dto.projection;

public record RoomSlotDetailStat(
        Long roomId,
        String roomName,
        Long slotId,
        String slotName,
        String startTime,
        String endTime,
        int roomCapacity,
        long bookingCount,
        long participantCount,
        long canceledCount,
        long thesisCount
) {}
