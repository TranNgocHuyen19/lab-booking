package iuh.labbooking.service.statistics;

import iuh.labbooking.dto.projection.GroupDistributionStat;
import iuh.labbooking.dto.projection.GroupUsageDetailStat;
import iuh.labbooking.dto.projection.SlotUsageStat;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.dashboard.KpiWithGrowth;
import iuh.labbooking.dto.response.statistics.*;
import iuh.labbooking.enums.GroupType;
import iuh.labbooking.mapper.GroupStatisticsMapper;
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
public class GroupStatisticsServiceImpl implements GroupStatisticsService {

    private final SlotBookingRepository slotBookingRepository;
    private final SlotRepository slotRepository;
    private final LabRoomRepository labRoomRepository;
    private final GroupStatisticsMapper groupStatisticsMapper;

    @Override
    public GroupStatisticsSummaryResponse getSummary(
            LocalDate startDate,
            LocalDate endDate,
            GroupType groupType,
            Long lecturerId
    ) {
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDate prevStartDate;
        LocalDate prevEndDate;

        if (daysBetween == 1) {
            prevStartDate = startDate.minusWeeks(1);
            prevEndDate = prevStartDate;
        } else {
            prevStartDate = startDate.minusDays(daysBetween);
            prevEndDate = startDate.minusDays(1);
        }

        List<GroupUsageDetailStat> currentStats = slotBookingRepository.findGroupUsageStats(
                startDate, endDate, groupType, lecturerId);
        
        long curActiveGroups = currentStats.stream().map(GroupUsageDetailStat::groupId).distinct().count();
        double curTotalHours = calculateTotalHours(currentStats);

        List<GroupUsageDetailStat> prevStats = slotBookingRepository.findGroupUsageStats(
                prevStartDate, prevEndDate, groupType, lecturerId);
        
        long prevActiveGroups = prevStats.stream().map(GroupUsageDetailStat::groupId).distinct().count();
        double prevTotalHours = calculateTotalHours(prevStats);

        KpiWithGrowth activeGroupsKpi = groupStatisticsMapper.toKpiWithGrowth((double) curActiveGroups, (double) prevActiveGroups);
        KpiWithGrowth totalHoursKpi = groupStatisticsMapper.toKpiWithGrowth(curTotalHours, prevTotalHours);

        Map<Long, Long> groupSlotCounts = currentStats.stream()
                .collect(Collectors.groupingBy(GroupUsageDetailStat::groupId,
                        Collectors.summingLong(GroupUsageDetailStat::slotCount)));

        Long mostUsedGroupId = groupSlotCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        GroupUsageDetailStat mostUsedStat = currentStats.stream()
                .filter(s -> s.groupId().equals(mostUsedGroupId))
                .findFirst()
                .orElse(null);

        double avgDuration = getAverageSlotDuration();
        GroupStatInfo mostUsedGroupInfo = groupStatisticsMapper.toGroupStatInfo(mostUsedStat,
                mostUsedGroupId != null ? groupSlotCounts.get(mostUsedGroupId) * avgDuration : 0.0);

        List<GroupDistributionStat> distributionStats = slotBookingRepository.findGroupDistributionStats(
                startDate, endDate, groupType, lecturerId);
        List<TypeDistributionInfo> typeDistribution = calculateTypeDistribution(distributionStats);

        long currentGroupSlots = currentStats.stream().mapToLong(GroupUsageDetailStat::slotCount).sum();
        long currentTotalSlots = slotBookingRepository.countApprovedSlotsFiltered(startDate, endDate, null, null);
        
        long prevGroupSlots = prevStats.stream().mapToLong(GroupUsageDetailStat::slotCount).sum();
        long prevTotalSlots = slotBookingRepository.countApprovedSlotsFiltered(prevStartDate, prevEndDate, null, null);

        double curOccupancy = currentTotalSlots > 0 ? Math.min((double) currentGroupSlots / currentTotalSlots * 100, 100.0) : 0.0;
        double prevOccupancy = prevTotalSlots > 0 ? Math.min((double) prevGroupSlots / prevTotalSlots * 100, 100.0) : 0.0;
        KpiWithGrowth occupancyKpi = groupStatisticsMapper.toKpiWithGrowth(curOccupancy, prevOccupancy);

        List<SlotUsageStat> slotStats = slotBookingRepository.findSlotUsageStats(
                startDate, endDate, null, null, PageRequest.of(0, 1));
        
        long totalRoomsAcrossDays = labRoomRepository.count() * (ChronoUnit.DAYS.between(startDate, endDate) + 1);
        ShiftPeakInfo peakShift = slotStats.isEmpty() || totalRoomsAcrossDays == 0
                ? new ShiftPeakInfo("-", 0.0)
                : new ShiftPeakInfo(slotStats.get(0).slotName(), Math.min((double) slotStats.getFirst().bookingCount() / totalRoomsAcrossDays * 100, 100.0));

        return GroupStatisticsSummaryResponse.builder()
                .activeGroups(activeGroupsKpi)
                .totalHours(totalHoursKpi)
                .typeDistribution(typeDistribution)
                .occupancyRate(occupancyKpi)
                .mostUsedGroup(mostUsedGroupInfo)
                .peakShift(peakShift)
                .build();
    }

    private List<TypeDistributionInfo> calculateTypeDistribution(List<GroupDistributionStat> stats) {
        if (stats.isEmpty()) return Collections.emptyList();

        Map<String, Long> typeCounts = stats.stream()
                .collect(Collectors.groupingBy(s -> s.bookingType().name(),
                        Collectors.summingLong(GroupDistributionStat::slotCount)));

        long totalSlots = typeCounts.values().stream().mapToLong(Long::longValue).sum();

        return typeCounts.entrySet().stream()
                .map(e -> new TypeDistributionInfo(
                        e.getKey(), 
                        e.getValue(), 
                        totalSlots > 0 ? (double) e.getValue() / totalSlots * 100 : 0.0))
                .sorted((a, b) -> Double.compare(b.percentage(), a.percentage()))
                .collect(Collectors.toList());
    }

    private double calculateTotalHours(List<GroupUsageDetailStat> stats) {
        Map<Long, Double> slotDurations = getSlotDurationMap();
        
        double avgDuration = slotDurations.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(2.5);
        
        return stats.stream().mapToLong(GroupUsageDetailStat::slotCount).sum() * avgDuration;
    }

    private Map<Long, Double> getSlotDurationMap() {
        return slotRepository.findAll().stream()
                .collect(Collectors.toMap(
                        Slot::getSlotId,
                        this::calculateSlotDurationHours
                ));
    }

    private double calculateSlotDurationHours(Slot slot) {
        if (slot.getStartTime() == null || slot.getEndTime() == null) {
            return 2.5; // Default fallback
        }
        long minutes = java.time.Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
        return minutes / 60.0;
    }

    private double getAverageSlotDuration() {
        List<Slot> slots = slotRepository.findAll();
        if (slots.isEmpty()) return 2.5;
        return slots.stream()
                .mapToDouble(this::calculateSlotDurationHours)
                .average()
                .orElse(2.5);
    }

    @Override
    public List<GroupUsageShiftStat> getDistribution(
            LocalDate startDate,
            LocalDate endDate,
            GroupType groupType,
            Long lecturerId
    ) {
        List<Slot> allSlots = slotRepository.findAll(Sort.by("startTime"));
        List<GroupDistributionStat> stats = slotBookingRepository.findGroupDistributionStats(
                startDate, endDate, groupType, lecturerId);

        Map<String, Double> slotDurationsByName = allSlots.stream()
                .collect(Collectors.toMap(
                        Slot::getSlotName,
                        this::calculateSlotDurationHours
                ));

        Map<String, Map<String, Double>> shiftTypeMap = new LinkedHashMap<>();
        for (Slot slot : allSlots) {
            shiftTypeMap.put(slot.getSlotName(), new HashMap<>());
        }

        for (GroupDistributionStat stat : stats) {
            Map<String, Double> types = shiftTypeMap.get(stat.slotName());
            if (types != null) {
                String typeName = stat.bookingType() != null ? stat.bookingType().name() : "OTHER";
                double slotDuration = slotDurationsByName.getOrDefault(stat.slotName(), 2.5);
                double hours = stat.slotCount() * slotDuration;
                types.put(typeName, hours);
            }
        }

        return shiftTypeMap.entrySet().stream()
                .map(e -> new GroupUsageShiftStat(e.getKey(), e.getValue()))
                .toList();
    }

    @Override
    public PageResponse<List<GroupUsageDetailResponse>> getUsageDetails(
            LocalDate startDate,
            LocalDate endDate,
            GroupType groupType,
            Long lecturerId,
            int page,
            int limit,
            String sortBy,
            String order
    ) {
        List<GroupUsageDetailStat> stats = slotBookingRepository.findGroupUsageStats(
                startDate, endDate, groupType, lecturerId);

        Map<Long, Map<String, Long>> roomFreqs = getFrequencyMap(slotBookingRepository.findGroupRoomFrequencies(startDate, endDate));
        Map<Long, Map<String, Long>> slotFreqs = getFrequencyMap(slotBookingRepository.findGroupSlotFrequencies(startDate, endDate));

        List<GroupUsageDetailResponse> allResponses = stats.stream()
                .map(stat -> {
                    String topRoom = getTopKey(roomFreqs.get(stat.groupId()));
                    String topSlot = getTopKey(slotFreqs.get(stat.groupId()));
                    double avgDuration = getAverageSlotDuration();
                    double hours = stat.slotCount() * avgDuration;
                    return groupStatisticsMapper.toGroupUsageDetailResponse(stat, topRoom, topSlot, hours);
                })
                .sorted(getComparator(sortBy, order))
                .toList();

        int totalItems = allResponses.size();
        int totalPages = (int) Math.ceil((double) totalItems / limit);
        int startIndex = page * limit;
        int endIndex = Math.min(startIndex + limit, totalItems);

        List<GroupUsageDetailResponse> pagedList = startIndex < totalItems 
                ? allResponses.subList(startIndex, endIndex) 
                : Collections.emptyList();

        return new PageResponse<>(pagedList, page, totalPages, limit, totalItems);
    }

    private Map<Long, Map<String, Long>> getFrequencyMap(List<Object[]> data) {
        Map<Long, Map<String, Long>> result = new HashMap<>();
        for (Object[] row : data) {
            Long groupId = (Long) row[0];
            String key = (String) row[1];
            Long count = (Long) row[2];
            result.computeIfAbsent(groupId, k -> new HashMap<>()).put(key, count);
        }
        return result;
    }

    private String getTopKey(Map<String, Long> freq) {
        if (freq == null || freq.isEmpty()) return "-";
        return freq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("-");
    }

    private Comparator<GroupUsageDetailResponse> getComparator(String sortBy, String order) {
        Comparator<GroupUsageDetailResponse> comparator;
        switch (sortBy != null ? sortBy : "totalHours") {
            case "groupName" -> comparator = Comparator.comparing(GroupUsageDetailResponse::groupName);
            case "groupType" -> comparator = Comparator.comparing(GroupUsageDetailResponse::groupType);
            case "lecturerName" -> comparator = Comparator.comparing(GroupUsageDetailResponse::lecturerName);
            case "bookingCount" -> comparator = Comparator.comparingInt(GroupUsageDetailResponse::bookingCount);
            default -> comparator = Comparator.comparingDouble(GroupUsageDetailResponse::totalHours);
        }
        return "asc".equalsIgnoreCase(order) ? comparator : comparator.reversed();
    }
}
