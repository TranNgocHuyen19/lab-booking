package iuh.labbooking.dto.response.statistics;

import lombok.Builder;

@Builder
public record LabBookingKpiResponse(
        long pendingCount,
        double avgProcessingSpeedMinutes,
        double approvalRate,
        double conflictRate
) {
}
