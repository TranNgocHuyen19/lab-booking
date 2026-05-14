package iuh.labbooking.mapper;

import iuh.labbooking.dto.projection.BookingTrendStat;
import iuh.labbooking.dto.projection.BookingTypeStat;
import iuh.labbooking.dto.projection.RoomActivity;
import iuh.labbooking.dto.response.dashboard.*;
import iuh.labbooking.model.Device;
import iuh.labbooking.model.Slot;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface DashboardMapper {

    DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    default ShiftInfo toShiftInfo(Slot slot) {
        if (slot == null) {
            return new ShiftInfo("-", "-");
        }
        String timeRange = formatTime(slot.getStartTime()) + " - " + formatTime(slot.getEndTime());
        return new ShiftInfo(slot.getSlotName(), timeRange);
    }

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

    private String formatTime(LocalTime time) {
        return time != null ? time.format(TIME_FORMATTER) : "-";
    }

    default List<RoomActivityResponse> toRoomActivityResponseList(
            List<RoomActivity> raws) {
        if (raws == null) return Collections.emptyList();

        Map<String,List<SlotStat>> grouped = raws.stream()
                .collect(Collectors.groupingBy(
                        RoomActivity::roomName,
                        Collectors.mapping(
                                raw -> new SlotStat(
                                        raw.slotName(),
                                        raw.startTime(),
                                        raw.endTime(),
                                        (int) raw.count()),
                                Collectors.toList()
                        )
                ));

        return grouped.entrySet().stream()
                .map(e -> new RoomActivityResponse(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    default BookingTypeDistributionResponse toBookingTypeDistributionResponse(BookingTypeStat stat) {
        if (stat == null) return null;
        return new BookingTypeDistributionResponse(
                stat.bookingType().name(),
                stat.count()
        );
    }

    default BookingTrendResponse toBookingTrendResponse(BookingTrendStat stat) {
        if (stat == null) return null;
        return new BookingTrendResponse(stat.date(), stat.count());
    }
}
