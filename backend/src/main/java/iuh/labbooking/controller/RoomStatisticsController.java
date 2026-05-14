package iuh.labbooking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.statistics.RoomHeatmapResponse;
import iuh.labbooking.dto.response.statistics.RoomStatisticsSummaryResponse;
import iuh.labbooking.dto.response.statistics.RoomUsageDetailResponse;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.service.statistics.RoomStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/statistics/rooms")
@RequiredArgsConstructor
@Tag(name = "Room Statistics", description = "Admin Room Statistics APIs")
@PreAuthorize("hasRole('ADMIN')")
public class RoomStatisticsController {

    private final RoomStatisticsService roomStatisticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get room statistics summary (KPI Cards)")
    public ResponseEntity<ApiResponse<RoomStatisticsSummaryResponse>> getSummary(
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Room ID (optional)")
            @RequestParam(required = false) Long roomId,
            @Parameter(description = "Activity type: THESIS, PERSONAL, GROUP (optional)")
            @RequestParam(required = false) BookingType activityType,
            @Parameter(description = "Booking status: PENDING, APPROVED, REJECTED, CANCELED, SYSTEM_CANCELED (optional)")
            @RequestParam(required = false) RequestStatus status
    ) {
        RoomStatisticsSummaryResponse response = roomStatisticsService.getSummary(
                startDate, endDate, roomId, activityType, status);
        return ResponseEntity.ok(ApiResponse.success("Room statistics summary retrieved successfully", response));
    }

    @GetMapping("/heatmap")
    @Operation(summary = "Get room × slot heatmap data")
    public ResponseEntity<ApiResponse<List<RoomHeatmapResponse>>> getHeatmap(
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Room ID (optional)")
            @RequestParam(required = false) Long roomId,
            @Parameter(description = "Activity type: THESIS, PERSONAL, GROUP (optional)")
            @RequestParam(required = false) BookingType activityType
    ) {
        List<RoomHeatmapResponse> response = roomStatisticsService.getHeatmap(
                startDate, endDate, roomId, activityType);
        return ResponseEntity.ok(ApiResponse.success("Room heatmap data retrieved successfully", response));
    }

    @GetMapping("/usage-details")
    @Operation(summary = "Get detailed room usage statistics (Table)")
    public ResponseEntity<ApiResponse<PageResponse<List<RoomUsageDetailResponse>>>> getUsageDetails(
            @Parameter(description = "Start date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Room ID (optional)")
            @RequestParam(required = false) Long roomId,
            @Parameter(description = "Activity type: THESIS, PERSONAL, GROUP (optional)")
            @RequestParam(required = false) BookingType activityType,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Items per page")
            @RequestParam(defaultValue = "10") int limit,
            @Parameter(description = "Sort by field: roomName, slotName, bookingCount, totalHours, participantCount, usageRate, canceledCount")
            @RequestParam(defaultValue = "usageRate") String sortBy,
            @Parameter(description = "Sort order: asc or desc")
            @RequestParam(defaultValue = "desc") String order
    ) {
        PageResponse<List<RoomUsageDetailResponse>> response = roomStatisticsService.getUsageDetails(
                startDate, endDate, roomId, activityType, page, limit, sortBy, order);
        return ResponseEntity.ok(ApiResponse.success("Room usage details retrieved successfully", response));
    }
}
