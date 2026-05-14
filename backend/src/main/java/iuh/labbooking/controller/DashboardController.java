package iuh.labbooking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.dashboard.*;
import iuh.labbooking.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard KPI APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpi")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get dashboard KPIs with date range filter")
    public ResponseEntity<ApiResponse<DashboardKpiResponse>> getKpi(
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        DashboardKpiResponse response = dashboardService.getKpi(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Dashboard KPIs retrieved successfully", response));
    }

    @GetMapping("/device-usage")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get top used devices")
    public ResponseEntity<ApiResponse<List<DeviceUsageResponse>>> getDeviceUsage(
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "5") int limit) {
        List<DeviceUsageResponse> response = dashboardService.getDeviceUsage(fromDate, toDate, limit);
        return ResponseEntity.ok(ApiResponse.success("Device usage statistics retrieved successfully", response));
    }

    @GetMapping("/room-activity")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get room activity for stacked bar chart")
    public ResponseEntity<ApiResponse<List<RoomActivityResponse>>> getRoomActivity(
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<RoomActivityResponse> response = dashboardService.getRoomActivity(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Room activity statistics retrieved successfully", response));
    }

    @GetMapping("/booking-type")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get booking type distribution")
    public ResponseEntity<ApiResponse<List<BookingTypeDistributionResponse>>> getBookingTypeDistribution(
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<BookingTypeDistributionResponse> response = dashboardService
                .getBookingTypeDistribution(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Booking type distribution retrieved successfully", response));
    }

    @GetMapping("/room-trend")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get booking trend (usage per day)")
    public ResponseEntity<ApiResponse<List<BookingTrendResponse>>> getBookingTrend(
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<BookingTrendResponse> response = dashboardService
                .getBookingTrend(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Booking trend retrieved successfully", response));
    }
}
