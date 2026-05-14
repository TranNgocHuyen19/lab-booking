package iuh.labbooking.dto.projection;

import java.time.LocalTime;

public record RoomActivity(
    String roomName,
    String slotName,
    LocalTime startTime,
    LocalTime endTime,
    long count
) {}
