package iuh.labbooking.service.statistics;

import iuh.labbooking.dto.projection.RoomSlotDetailStat;
import iuh.labbooking.dto.projection.RoomSlotUsageStat;
import iuh.labbooking.dto.projection.RoomUsageStat;
import iuh.labbooking.dto.projection.SlotUsageStat;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.dashboard.KpiWithGrowth;
import iuh.labbooking.dto.response.statistics.*;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.mapper.RoomStatisticsMapper;
import iuh.labbooking.model.LabRoom;
import iuh.labbooking.model.Slot;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.repository.SlotBookingRepository;
import iuh.labbooking.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomStatisticsServiceImpl implements RoomStatisticsService {

    private final SlotBookingRepository slotBookingRepository;
    private final SlotRepository slotRepository;
    private final LabRoomRepository labRoomRepository;
    private final RoomStatisticsMapper roomStatisticsMapper;

    @Override
    public RoomStatisticsSummaryResponse getSummary(
            LocalDate startDate,
            LocalDate endDate,
            Long roomId,
            BookingType activityType,
            RequestStatus status
    ) {
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDate prevStartDate;
        LocalDate prevEndDate;

        if (daysBetween == 1) {
            prevStartDate = startDate.minusWeeks(1);
            prevEndDate = endDate.minusWeeks(1);
        } else if (startDate.getDayOfMonth() == 1 && endDate.equals(startDate.plusMonths(1).minusDays(1))) {
            prevStartDate = startDate.minusMonths(1);
            prevEndDate = startDate.minusDays(1);
        } else if (startDate.getDayOfYear() == 1 && endDate.equals(LocalDate.of(startDate.getYear(), 12, 31))) {
            prevStartDate = startDate.minusYears(1);
            prevEndDate = endDate.minusYears(1);
        } else {
            prevStartDate = startDate.minusDays(daysBetween);
            prevEndDate = startDate.minusDays(1);
        }

        long totalRooms = roomId != null ? 1 : labRoomRepository.count();

        List<RoomUsageStat> roomStats = slotBookingRepository.findRoomUsageStats(
                startDate, endDate, roomId, activityType, PageRequest.of(0, 100));

        double curUsageRate = calculateAverageOccupancy(roomStats, daysBetween);

        List<RoomUsageStat> prevRoomStats = slotBookingRepository.findRoomUsageStats(
                prevStartDate, prevEndDate, roomId, activityType, PageRequest.of(0, 100));
        double prevUsageRate = calculateAverageOccupancy(prevRoomStats, daysBetween);

        KpiWithGrowth usageRateKpi = roomStatisticsMapper.toKpiWithGrowth(curUsageRate, prevUsageRate);

        RoomInfo mostUsedRoom = roomStats.isEmpty()
                ? new RoomInfo("-", 0.0, 0)
                : roomStatisticsMapper.toRoomInfo(roomStats.get(0), daysBetween);

        RoomInfo leastUsedRoom = roomStats.isEmpty()
                ? new RoomInfo("-", 0.0, 0)
                : roomStatisticsMapper.toRoomInfo(roomStats.get(roomStats.size() - 1), daysBetween);

        List<SlotUsageStat> slotStats = slotBookingRepository.findSlotUsageStats(
                startDate, endDate, roomId, activityType, PageRequest.of(0, 1));

        ShiftPeakInfo peakShift = slotStats.isEmpty()
                ? new ShiftPeakInfo("-", 0.0)
                : roomStatisticsMapper.toShiftPeakInfo(slotStats.get(0), daysBetween, totalRooms);

        return RoomStatisticsSummaryResponse.builder()
                .usageRate(usageRateKpi)
                .mostUsedRoom(mostUsedRoom)
                .leastUsedRoom(leastUsedRoom)
                .peakShift(peakShift)
                .build();
    }

    private double calculateAverageOccupancy(List<RoomUsageStat> roomStats, long totalDays) {
        if (roomStats.isEmpty()) {
            return 0.0;
        }

        double totalOccupancy = 0.0;
        int validRooms = 0;

        for (RoomUsageStat stat : roomStats) {
            if (stat.bookingCount() > 0) {
                double roomOccupancy = calculateRoomOccupancy(stat, totalDays);
                totalOccupancy += roomOccupancy;
                validRooms++;
            }
        }

        if (validRooms == 0) {
            return 0.0;
        }

        return Math.round(totalOccupancy / validRooms * 10) / 10.0;
    }

    private double calculateRoomOccupancy(RoomUsageStat stat, long totalDays) {
        if (stat.bookingCount() == 0) {
            return 0.0;
        }

        long thesisCount = stat.thesisCount();
        long nonThesisCount = stat.bookingCount() - thesisCount;
        int capacity = stat.roomCapacity();

        double thesisOccupancy = thesisCount * 100.0;
        double nonThesisOccupancy = 0.0;

        if (nonThesisCount > 0 && capacity > 0) {
            double attendeesPerBooking = (double) stat.totalAttendees() / Math.max(nonThesisCount, 1);
            nonThesisOccupancy = (attendeesPerBooking / capacity) * 100 * nonThesisCount;
            nonThesisOccupancy = Math.min(nonThesisOccupancy, 100.0 * nonThesisCount);
        }

        double averageOccupancy = (thesisOccupancy + nonThesisOccupancy) / stat.bookingCount();
        return Math.min(averageOccupancy, 100.0);
    }

    @Override
    public List<RoomHeatmapResponse> getHeatmap(
            LocalDate startDate,
            LocalDate endDate,
            Long roomId,
            BookingType activityType
    ) {
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        List<Slot> allSlots = slotRepository.findAll(Sort.by("startTime"));

        List<LabRoom> allRooms;
        if (roomId != null) {
            allRooms = labRoomRepository.findById(roomId)
                    .map(List::of)
                    .orElse(Collections.emptyList());
        } else {
            allRooms = labRoomRepository.findAll(Sort.by("roomName"));
        }

        List<RoomSlotUsageStat> stats = slotBookingRepository.findRoomSlotUsageStats(
                startDate, endDate, roomId, activityType);

        return roomStatisticsMapper.toRoomHeatmapResponseList(stats, allSlots, allRooms, daysBetween);
    }

    @Override
    public PageResponse<List<RoomUsageDetailResponse>> getUsageDetails(
            LocalDate startDate,
            LocalDate endDate,
            Long roomId,
            BookingType activityType,
            int page,
            int limit,
            String sortBy,
            String order
    ) {
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        List<Slot> allSlots = slotRepository.findAll();
        Map<Long, Slot> slotMap = allSlots.stream()
                .collect(Collectors.toMap(Slot::getSlotId, s -> s));

        List<RoomSlotDetailStat> stats = slotBookingRepository.findRoomSlotDetailStats(
                startDate, endDate, roomId, activityType);

        Map<String, Long> canceledMap = getCanceledCountMap(startDate, endDate, roomId, activityType);

        List<RoomUsageDetailResponse> allDetails = stats.stream()
                .map(stat -> {
                    String key = stat.roomId() + "-" + stat.slotId();
                    long canceledCount = canceledMap.getOrDefault(key, 0L);
                    return roomStatisticsMapper.toRoomUsageDetailResponse(
                            stat, daysBetween, slotMap.get(stat.slotId()), canceledCount);
                })
                .filter(Objects::nonNull)
                .toList();

        Comparator<RoomUsageDetailResponse> comparator = getComparator(sortBy, order);
        List<RoomUsageDetailResponse> sortedDetails = allDetails.stream()
                .sorted(comparator)
                .toList();

        int totalItems = sortedDetails.size();
        int totalPages = (int) Math.ceil((double) totalItems / limit);
        int startIndex = page * limit;
        int endIndex = Math.min(startIndex + limit, totalItems);

        List<RoomUsageDetailResponse> pagedDetails = startIndex < totalItems
                ? sortedDetails.subList(startIndex, endIndex)
                : Collections.emptyList();

        return new PageResponse<>(pagedDetails, page, totalPages, limit, totalItems);
    }

    private Map<String, Long> getCanceledCountMap(
            LocalDate startDate,
            LocalDate endDate,
            Long roomId,
            BookingType activityType
    ) {
        List<Object[]> canceledData = slotBookingRepository.findCanceledCountByRoomAndSlot(
                startDate, endDate, roomId, activityType);

        Map<String, Long> canceledMap = new HashMap<>();
        for (Object[] row : canceledData) {
            Long labRoomId = (Long) row[0];
            Long slotId = (Long) row[1];
            Long count = (Long) row[2];
            canceledMap.put(labRoomId + "-" + slotId, count);
        }
        return canceledMap;
    }

    private Comparator<RoomUsageDetailResponse> getComparator(String sortBy, String order) {
        Comparator<RoomUsageDetailResponse> comparator;

        switch (sortBy != null ? sortBy : "usageRate") {
            case "roomName" -> comparator = Comparator.comparing(RoomUsageDetailResponse::roomName);
            case "slotName" -> comparator = Comparator.comparing(RoomUsageDetailResponse::slotName);
            case "bookingCount" -> comparator = Comparator.comparingInt(RoomUsageDetailResponse::bookingCount);
            case "totalHours" -> comparator = Comparator.comparingDouble(RoomUsageDetailResponse::totalHours);
            case "participantCount" -> comparator = Comparator.comparingInt(RoomUsageDetailResponse::participantCount);
            case "canceledCount" -> comparator = Comparator.comparingInt(RoomUsageDetailResponse::canceledCount);
            default -> comparator = Comparator.comparingDouble(RoomUsageDetailResponse::usageRate);
        }

        if ("asc".equalsIgnoreCase(order)) {
            return comparator;
        }
        return comparator.reversed();
    }
}
