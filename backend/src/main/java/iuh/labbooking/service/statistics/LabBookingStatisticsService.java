package iuh.labbooking.service.statistics;

import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.statistics.*;
import iuh.labbooking.enums.RequestStatus;

import java.time.LocalDate;
import java.util.List;

public interface LabBookingStatisticsService {
    LabBookingKpiResponse getKpis(LocalDate startDate, LocalDate endDate);
    List<BookingOutcomeResponse> getOutcomeDistribution(LocalDate startDate, LocalDate endDate);
    List<SubmissionTrendResponse> getSubmissionTrend(LocalDate startDate, LocalDate endDate);
    PageResponse<List<BookingAuditLogResponse>> getAuditLogs(
            LocalDate startDate, LocalDate endDate, RequestStatus status, String adminId, int page, int limit);
}
