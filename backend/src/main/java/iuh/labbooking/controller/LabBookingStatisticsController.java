package iuh.labbooking.controller;

import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.statistics.*;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.service.statistics.LabBookingStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/statistics/lab-bookings")
@RequiredArgsConstructor
@Tag(name = "Admin Lab Booking Statistics", description = "Endpoints for lab booking approval statistics")
@PreAuthorize("hasRole('ADMIN')")
public class LabBookingStatisticsController {

    private final LabBookingStatisticsService labBookingStatisticsService;

    @GetMapping("/kpis")
    @Operation(summary = "Get lab booking statistics KPIs")
    public ApiResponse<LabBookingKpiResponse> getKpis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ApiResponse.success(labBookingStatisticsService.getKpis(startDate, endDate));
    }

    @GetMapping("/outcome-distribution")
    @Operation(summary = "Get booking outcome distribution")
    public ApiResponse<List<BookingOutcomeResponse>> getOutcomeDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ApiResponse.success(labBookingStatisticsService.getOutcomeDistribution(startDate, endDate));
    }

    @GetMapping("/submission-trend")
    @Operation(summary = "Get booking submission hourly trend")
    public ApiResponse<List<SubmissionTrendResponse>> getSubmissionTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ApiResponse.success(labBookingStatisticsService.getSubmissionTrend(startDate, endDate));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get recent processing history (Audit Logs)")
    public ApiResponse<PageResponse<List<BookingAuditLogResponse>>> getAuditLogs(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) String adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ApiResponse.success(labBookingStatisticsService.getAuditLogs(startDate, endDate, status, adminId, page, limit));
    }
}
