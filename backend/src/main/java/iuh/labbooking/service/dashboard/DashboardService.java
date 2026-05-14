package iuh.labbooking.service.dashboard;

import iuh.labbooking.dto.response.dashboard.*;

import java.time.LocalDate;
import java.util.List;

public interface DashboardService {
    
    DashboardKpiResponse getKpi(LocalDate fromDate, LocalDate toDate);

    List<DeviceUsageResponse> getDeviceUsage(LocalDate fromDate, LocalDate toDate, int limit);

    List<RoomActivityResponse> getRoomActivity(LocalDate fromDate, LocalDate toDate);
    
    List<BookingTypeDistributionResponse> getBookingTypeDistribution(LocalDate fromDate, LocalDate toDate);

    List<BookingTrendResponse> getBookingTrend(LocalDate fromDate, LocalDate toDate);
}
