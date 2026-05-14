package iuh.labbooking.dto.response.dashboard;

import lombok.Builder;

@Builder
public record DashboardKpiResponse(
        KpiWithGrowth totalBooking,
        KpiWithGrowth usageRate,
        ShiftInfo peakShift,
        ShiftInfo lowShift,
        KpiWithGrowth pendingApproval,
        KpiWithGrowth noShowRate
) {
}
