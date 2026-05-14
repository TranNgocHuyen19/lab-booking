package iuh.labbooking.service.dashboard;

import iuh.labbooking.dto.projection.RoomActivity;
import iuh.labbooking.dto.response.dashboard.*;
import iuh.labbooking.mapper.DashboardMapper;
import iuh.labbooking.model.Slot;
import iuh.labbooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final SlotBookingRepository slotBookingRepository;
    private final SlotRepository slotRepository;
    private final LabRoomRepository labRoomRepository;
    private final BookingSlotAttendanceRepository attendanceRepository;
    private final BookingDeviceRepository bookingDeviceRepository;
    private final DashboardMapper dashboardMapper;

    @Override
    public DashboardKpiResponse getKpi(LocalDate fromDate, LocalDate toDate) {
        long daysBetween = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        LocalDate prevFromDate;
        LocalDate prevToDate;

        if (daysBetween == 1) {
            prevFromDate = fromDate.minusWeeks(1);
            prevToDate = toDate.minusWeeks(1);
        } else if (fromDate.getDayOfMonth() == 1 && toDate.equals(fromDate.plusMonths(1).minusDays(1))) {
            prevFromDate = fromDate.minusMonths(1);
            prevToDate = fromDate.minusDays(1);
        } else if (fromDate.getDayOfYear() == 1 && toDate.equals(LocalDate.of(fromDate.getYear(), 12, 31))) {
            prevFromDate = fromDate.minusYears(1);
            prevToDate = toDate.minusYears(1);
        } else {
            prevFromDate = fromDate.minusDays(daysBetween);
            prevToDate = fromDate.minusDays(1);
        }

        long curTotal = slotBookingRepository.countTotalBookings(fromDate, toDate);
        long prevTotal = slotBookingRepository.countTotalBookings(prevFromDate, prevToDate);
        KpiWithGrowth totalKpi = dashboardMapper.toKpiWithGrowth(curTotal, prevTotal);

        long totalSlotsAvailable = labRoomRepository.count() * slotRepository.count() * daysBetween;
        long prevTotalSlotsAvailable = labRoomRepository.count() * slotRepository.count() * daysBetween;

        long curApprovedSlots = slotBookingRepository.countApprovedSlots(fromDate, toDate);
        long prevApprovedSlots = slotBookingRepository.countApprovedSlots(prevFromDate, prevToDate);

        double curUsageRate = calculatePercentage(curApprovedSlots, totalSlotsAvailable);
        double prevUsageRate = calculatePercentage(prevApprovedSlots, prevTotalSlotsAvailable);
        KpiWithGrowth usageRateKpi = dashboardMapper.toKpiWithGrowth(curUsageRate, prevUsageRate);

        long curPending = slotBookingRepository.countPendingBookings(fromDate, toDate);
        long prevPending = slotBookingRepository.countPendingBookings(prevFromDate, prevToDate);
        KpiWithGrowth pendingKpi = dashboardMapper.toKpiWithGrowth(curPending, prevPending);

        double curNoShowRate = calculateNoShowRate(fromDate, toDate);
        double prevNoShowRate = calculateNoShowRate(prevFromDate, prevToDate);
        KpiWithGrowth noShowRateKpi = dashboardMapper.toKpiWithGrowth(curNoShowRate, prevNoShowRate);

        ShiftInfo peakShift = findPeakShift(fromDate, toDate);
        ShiftInfo lowShift = findLowShift(fromDate, toDate);

        return new DashboardKpiResponse(
                totalKpi,
                usageRateKpi,
                peakShift,
                lowShift,
                pendingKpi,
                noShowRateKpi
        );
    }

    private double calculateNoShowRate(LocalDate fromDate, LocalDate toDate) {
        List<Object[]> stats = attendanceRepository.getNoShowStats(fromDate, toDate);
        if (stats.isEmpty() || stats.getFirst()[0] == null) {
            return 0.0;
        }

        long totalParticipants = ((Number) stats.get(0)[0]).longValue();
        long noShowCount = stats.getFirst()[1] != null ? ((Number) stats.getFirst()[1]).longValue() : 0;

        if (totalParticipants == 0) return 0.0;

        return Math.round((double) noShowCount / totalParticipants * 100 * 10) / 10.0;
    }

    private ShiftInfo findPeakShift(LocalDate fromDate, LocalDate toDate) {
        List<Object[]> peakData = slotBookingRepository.findBusyShifts(fromDate, toDate, PageRequest.of(0, 1));
        if (peakData.isEmpty()) {
            return new ShiftInfo("-", "-");
        }
        return dashboardMapper.toShiftInfo((Slot) peakData.getFirst()[0]);
    }

    private ShiftInfo findLowShift(LocalDate fromDate, LocalDate toDate) {
        List<Object[]> quietData = slotBookingRepository.findQuietShifts(fromDate, toDate, PageRequest.of(0, 1));
        if (quietData.isEmpty()) {
            List<Slot> allSlots = slotRepository.findAll();
            return allSlots.isEmpty() ? new ShiftInfo("-", "-") : dashboardMapper.toShiftInfo(allSlots.get(0));
        }
        return dashboardMapper.toShiftInfo((Slot) quietData.getFirst()[0]);
    }

    private double calculatePercentage(long part, long total) {
        if (total == 0) return 0.0;
        return Math.round((double) part / total * 100 * 10) / 10.0;
    }

    @Override
    public List<DeviceUsageResponse> getDeviceUsage(LocalDate fromDate, LocalDate toDate, int limit) {
        return bookingDeviceRepository.findTopUsedDevices(fromDate, toDate, PageRequest.of(0, limit));
    }

    @Override
    public List<RoomActivityResponse> getRoomActivity(LocalDate fromDate, LocalDate toDate) {
        List<RoomActivity> raws = slotBookingRepository.findRoomActivity(fromDate, toDate);
        return dashboardMapper.toRoomActivityResponseList(raws);
    }

    @Override
    public List<BookingTypeDistributionResponse> getBookingTypeDistribution(
            LocalDate fromDate, LocalDate toDate) {
        return slotBookingRepository.findBookingTypeDistribution(fromDate, toDate).stream()
                .map(dashboardMapper::toBookingTypeDistributionResponse)
                .toList();
    }

    @Override
    public List<BookingTrendResponse> getBookingTrend(LocalDate fromDate, LocalDate toDate) {
        return slotBookingRepository.findBookingTrend(fromDate, toDate).stream()
                .map(dashboardMapper::toBookingTrendResponse)
                .toList();
    }
}
