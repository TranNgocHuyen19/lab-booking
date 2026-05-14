package iuh.labbooking.service.statistics;

import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.statistics.RoomHeatmapResponse;
import iuh.labbooking.dto.response.statistics.RoomStatisticsSummaryResponse;
import iuh.labbooking.dto.response.statistics.RoomUsageDetailResponse;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;

import java.time.LocalDate;
import java.util.List;

public interface RoomStatisticsService {

    RoomStatisticsSummaryResponse getSummary(
            LocalDate startDate,
            LocalDate endDate,
            Long roomId,
            BookingType activityType,
            RequestStatus status
    );

    List<RoomHeatmapResponse> getHeatmap(
            LocalDate startDate,
            LocalDate endDate,
            Long roomId,
            BookingType activityType
    );

    PageResponse<List<RoomUsageDetailResponse>> getUsageDetails(
            LocalDate startDate,
            LocalDate endDate,
            Long roomId,
            BookingType activityType,
            int page,
            int limit,
            String sortBy,
            String order
    );
}
