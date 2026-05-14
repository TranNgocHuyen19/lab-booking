package iuh.labbooking.controller;

import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.statistics.GroupStatisticsSummaryResponse;
import iuh.labbooking.dto.response.statistics.GroupUsageDetailResponse;
import iuh.labbooking.dto.response.statistics.GroupUsageShiftStat;
import iuh.labbooking.enums.GroupType;
import iuh.labbooking.service.statistics.GroupStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/statistics/groups")
@RequiredArgsConstructor
@Tag(name = "Admin Group Statistics", description = "Endpoints for group usage reporting")
@PreAuthorize("hasRole('ADMIN')")
public class GroupStatisticsController {

    private final GroupStatisticsService groupStatisticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get group statistics summary")
    public ApiResponse<GroupStatisticsSummaryResponse> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) GroupType groupType,
            @RequestParam(required = false) Long lecturerId
    ) {
        return ApiResponse.success(groupStatisticsService.getSummary(startDate, endDate, groupType, lecturerId));
    }

    @GetMapping("/distribution")
    @Operation(summary = "Get usage distribution by shift and booking type")
    public ApiResponse<List<GroupUsageShiftStat>> getDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) GroupType groupType,
            @RequestParam(required = false) Long lecturerId
    ) {
        return ApiResponse.success(groupStatisticsService.getDistribution(startDate, endDate, groupType, lecturerId));
    }

    @GetMapping("/usage-details")
    @Operation(summary = "Get detailed usage list for groups")
    public ApiResponse<PageResponse<List<GroupUsageDetailResponse>>> getUsageDetails(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) GroupType groupType,
            @RequestParam(required = false) Long lecturerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "totalHours") String sortBy,
            @RequestParam(defaultValue = "desc") String order
    ) {
        return ApiResponse.success(groupStatisticsService.getUsageDetails(
                startDate, endDate, groupType, lecturerId, page, limit, sortBy, order));
    }
}
