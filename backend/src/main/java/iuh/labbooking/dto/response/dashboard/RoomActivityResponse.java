package iuh.labbooking.dto.response.dashboard;

import java.util.List;

public record RoomActivityResponse(
    String roomName,
    List<SlotStat> slots
) {}
