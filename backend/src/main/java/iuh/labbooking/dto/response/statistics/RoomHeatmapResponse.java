package iuh.labbooking.dto.response.statistics;

import java.util.List;

public record RoomHeatmapResponse(
        String roomName,
        Long roomId,
        List<ShiftUsage> shifts
) {}
