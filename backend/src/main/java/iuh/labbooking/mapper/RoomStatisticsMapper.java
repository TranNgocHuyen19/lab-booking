package iuh.labbooking.mapper;

import iuh.labbooking.dto.projection.RoomSlotDetailStat;
import iuh.labbooking.dto.projection.RoomSlotUsageStat;
import iuh.labbooking.dto.projection.RoomUsageStat;
import iuh.labbooking.dto.projection.SlotUsageStat;
import iuh.labbooking.dto.response.dashboard.KpiWithGrowth;
import iuh.labbooking.dto.response.statistics.*;
import iuh.labbooking.model.LabRoom;
import iuh.labbooking.model.Slot;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoomStatisticsMapper {

    DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    default KpiWithGrowth toKpiWithGrowth(double currentValue, double previousValue) {
        if (previousValue < 5 && previousValue != 0) {
            return new KpiWithGrowth(currentValue, null, currentValue >= previousValue);
        }

        if (previousValue == 0) {
            if (currentValue == 0) return new KpiWithGrowth(currentValue, 0.0, true);
            return new KpiWithGrowth(currentValue, 100.0, true);
        }

        double growth = Math.round((currentValue - previousValue) / previousValue * 100 * 10) / 10.0;
        return new KpiWithGrowth(currentValue, Math.abs(growth), growth >= 0);
    }

    default double calculateOccupancyRate(long thesisCount, long totalAttendees, int roomCapacity, long bookingCount, long totalDays) {
        if (bookingCount == 0) {
            return 0.0;
        }

        if (thesisCount > 0) {
            double thesisOccupancy = thesisCount * 100.0;
            
            long nonThesisCount = bookingCount - thesisCount;
            double nonThesisOccupancy = 0.0;
            
            if (nonThesisCount > 0 && roomCapacity > 0) {
                double avgAttendeesPerBooking = (double) totalAttendees / nonThesisCount;
                nonThesisOccupancy = (avgAttendeesPerBooking / roomCapacity) * 100 * nonThesisCount;
                nonThesisOccupancy = Math.min(nonThesisOccupancy, 100.0 * nonThesisCount);
            }
            
            double averageOccupancy = (thesisOccupancy + nonThesisOccupancy) / bookingCount;
            return Math.round(averageOccupancy * 10) / 10.0;
        }

        if (roomCapacity > 0) {
            double averageAttendeesPerBooking = (double) totalAttendees / bookingCount;
            double occupancyRate = (averageAttendeesPerBooking / roomCapacity) * 100;
            return Math.round(Math.min(occupancyRate, 100.0) * 10) / 10.0;
        }

        return calculatePercentage(bookingCount, totalDays);
    }

    default RoomInfo toRoomInfo(RoomUsageStat stat, long totalDays) {
        if (stat == null) {
            return new RoomInfo("-", 0.0, 0);
        }
        
        double usageRate = calculateOccupancyRate(
                stat.thesisCount(),
                stat.totalAttendees(),
                stat.roomCapacity(),
                stat.bookingCount(),
                totalDays
        );
        
        return new RoomInfo(stat.roomName(), usageRate, (int) stat.bookingCount());
    }

    default ShiftPeakInfo toShiftPeakInfo(SlotUsageStat stat, long totalDays, long totalRooms) {
        if (stat == null) {
            return new ShiftPeakInfo("-", 0.0);
        }
        double usageRate = calculatePercentage(stat.bookingCount(), totalDays * totalRooms);
        return new ShiftPeakInfo(stat.slotName(), Math.min(usageRate, 100.0));
    }

    default List<RoomHeatmapResponse> toRoomHeatmapResponseList(
            List<RoomSlotUsageStat> stats,
            List<Slot> allSlots,
            List<LabRoom> allRooms,
            long totalDays
    ) {
        if (allRooms == null || allRooms.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, Map<Long, RoomSlotUsageStat>> roomSlotMap = new HashMap<>();
        if (stats != null) {
            for (RoomSlotUsageStat stat : stats) {
                roomSlotMap
                        .computeIfAbsent(stat.roomId(), k -> new HashMap<>())
                        .put(stat.slotId(), stat);
            }
        }

        List<RoomHeatmapResponse> result = new ArrayList<>();

        for (LabRoom room : allRooms) {
            Map<Long, RoomSlotUsageStat> slotStatMap = roomSlotMap.getOrDefault(room.getLabRoomId(), new HashMap<>());
            int roomCapacity = room.getCapacity() != null ? room.getCapacity() : 40; // default capacity

            List<ShiftUsage> shifts = allSlots.stream()
                    .map(slot -> {
                        RoomSlotUsageStat stat = slotStatMap.get(slot.getSlotId());
                        String timeRange = formatTime(slot.getStartTime()) + " - " + formatTime(slot.getEndTime());

                        if (stat == null) {
                            // Phòng này không có booking cho ca này → 0%
                            return new ShiftUsage(
                                    slot.getSlotId(),
                                    slot.getSlotName(),
                                    timeRange,
                                    0.0,
                                    0
                            );
                        }

                        double usageRate = calculateOccupancyRate(
                                stat.thesisCount(),
                                stat.totalAttendees(),
                                stat.roomCapacity() > 0 ? stat.roomCapacity() : roomCapacity,
                                stat.bookingCount(),
                                totalDays
                        );

                        return new ShiftUsage(
                                slot.getSlotId(),
                                slot.getSlotName(),
                                timeRange,
                                usageRate,
                                (int) stat.bookingCount()
                        );
                    })
                    .toList();

            result.add(new RoomHeatmapResponse(room.getRoomName(), room.getLabRoomId(), shifts));
        }

        return result;
    }

    default RoomUsageDetailResponse toRoomUsageDetailResponse(
            RoomSlotDetailStat stat,
            long totalDays,
            Slot slot,
            long canceledCount
    ) {
        if (stat == null) {
            return null;
        }

        double usageRate = calculateOccupancyRate(
                stat.thesisCount(),
                stat.participantCount(),
                stat.roomCapacity(),
                stat.bookingCount(),
                totalDays
        );

        double totalHours = stat.bookingCount() * calculateSlotDuration(slot);

        return new RoomUsageDetailResponse(
                stat.roomId(),
                stat.roomName(),
                stat.slotId(),
                stat.slotName(),
                (int) stat.bookingCount(),
                totalHours,
                (int) stat.participantCount(),
                usageRate,
                (int) canceledCount
        );
    }

    private double calculatePercentage(long part, long total) {
        if (total == 0) return 0.0;
        return Math.round((double) part / total * 100 * 10) / 10.0;
    }

    private String formatTime(LocalTime time) {
        return time != null ? time.format(TIME_FORMATTER) : "-";
    }

    private double calculateSlotDuration(Slot slot) {
        if (slot == null || slot.getStartTime() == null || slot.getEndTime() == null) {
            return 2.5; 
        }
        return ChronoUnit.MINUTES.between(slot.getStartTime(), slot.getEndTime()) / 60.0;
    }
}
