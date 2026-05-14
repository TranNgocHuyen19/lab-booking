package iuh.labbooking.service.statistics;

import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.statistics.*;
import iuh.labbooking.enums.GroupType;

import java.time.LocalDate;
import java.util.List;

public interface GroupStatisticsService {

    GroupStatisticsSummaryResponse getSummary(
            LocalDate startDate,
            LocalDate endDate,
            GroupType groupType,
            Long lecturerId
    );

    List<GroupUsageShiftStat> getDistribution(
            LocalDate startDate,
            LocalDate endDate,
            GroupType groupType,
            Long lecturerId
    );

    PageResponse<List<GroupUsageDetailResponse>> getUsageDetails(
            LocalDate startDate,
            LocalDate endDate,
            GroupType groupType,
            Long lecturerId,
            int page,
            int limit,
            String sortBy,
            String order
    );
}
