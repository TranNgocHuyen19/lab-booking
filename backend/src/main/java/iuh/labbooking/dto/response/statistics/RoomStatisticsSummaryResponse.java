package iuh.labbooking.dto.response.statistics;

import iuh.labbooking.dto.response.dashboard.KpiWithGrowth;
import lombok.Builder;

@Builder
public record RoomStatisticsSummaryResponse(
        KpiWithGrowth usageRate,
        RoomInfo mostUsedRoom,
        RoomInfo leastUsedRoom,
        ShiftPeakInfo peakShift
) {}
