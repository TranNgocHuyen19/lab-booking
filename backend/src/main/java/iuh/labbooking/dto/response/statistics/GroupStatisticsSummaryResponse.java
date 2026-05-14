package iuh.labbooking.dto.response.statistics;

import iuh.labbooking.dto.response.dashboard.KpiWithGrowth;
import lombok.Builder;
import java.util.List;

@Builder
public record GroupStatisticsSummaryResponse(
        KpiWithGrowth activeGroups,
        KpiWithGrowth totalHours,
        List<TypeDistributionInfo> typeDistribution,
        KpiWithGrowth occupancyRate,
        GroupStatInfo mostUsedGroup,
        ShiftPeakInfo peakShift
) {
}
